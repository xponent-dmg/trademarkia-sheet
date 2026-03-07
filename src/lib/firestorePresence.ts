import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const DOCUMENTS_COLLECTION = "documents";
const PRESENCE_SUBCOLLECTION = "presence";

export interface ActiveUser {
  userId: string;
  name: string;
  color: string;
   joinedAt?: Timestamp;
  selectedCell?: string | null;
}

/**
 * Generates a deterministic color for a given user ID using the golden ratio.
 * @param userId The unique user ID.
 * @returns An HSL color string.
 */
export const generateUserColor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const charCode = userId.charCodeAt(i);
    hash = charCode + ((hash << 5) - hash);
  }
  
  const baseHue = Math.abs(hash) % 360;
  // Apply golden ratio spacing
  const hue = (baseHue + 137.508) % 360;
  
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Adds a user's presence to a document.
 * @param documentId The ID of the document.
 * @param userId The ID of the user.
 * @param name The display name of the user.
 */
export const addPresence = async (
  documentId: string,
  userId: string,
  name: string
): Promise<void> => {
  try {
    const presenceRef = doc(db, DOCUMENTS_COLLECTION, documentId, PRESENCE_SUBCOLLECTION, userId);
    
    const color = generateUserColor(userId);

    await setDoc(presenceRef, {
      userId,
      name,
      color,
      joinedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding presence:", error);
  }
};

/**
 * Removes a user's presence from a document.
 * @param documentId The ID of the document.
 * @param userId The ID of the user.
 */
export const removePresence = async (
  documentId: string,
  userId: string
): Promise<void> => {
  try {
    const presenceRef = doc(db, DOCUMENTS_COLLECTION, documentId, PRESENCE_SUBCOLLECTION, userId);
    await deleteDoc(presenceRef);
  } catch (error) {
    console.error("Error removing presence:", error);
  }
};

/**
 * Updates a user's selected cell in their presence document.
 * @param documentId The ID of the document.
 * @param userId The ID of the user.
 * @param selectedCell The selected cell ID, or null.
 */
export const updatePresenceSelection = async (
  documentId: string,
  userId: string,
  selectedCell: string | null
): Promise<void> => {
  try {
    const presenceRef = doc(db, DOCUMENTS_COLLECTION, documentId, PRESENCE_SUBCOLLECTION, userId);
    await updateDoc(presenceRef, {
      selectedCell,
    });
  } catch (error) {
    console.error("Error updating presence selection:", error);
  }
};

/**
 * Subscribes to the active users in a document.
 * @param documentId The ID of the document to monitor.
 * @param onUpdate Callback fired when the active users change.
 * @returns An unsubscribe function.
 */
export const subscribeToPresence = (
  documentId: string,
  onUpdate: (users: ActiveUser[]) => void
) => {
  const presenceRef = collection(db, DOCUMENTS_COLLECTION, documentId, PRESENCE_SUBCOLLECTION);

  return onSnapshot(
    presenceRef,
    (snapshot) => {
      const users: ActiveUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          userId: data.userId || docSnap.id,
          name: data.name,
          color: data.color,
          joinedAt: data.joinedAt,
          selectedCell: data.selectedCell || null,
        });
      });
      onUpdate(users);
    },
    (error) => {
      console.error("Error subscribing to presence:", error);
    }
  );
};
