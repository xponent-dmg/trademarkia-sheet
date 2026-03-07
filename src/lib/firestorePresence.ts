import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const PRESENCE_COLLECTION = "presence";

export interface ActiveUser {
  userId: string;
  name: string;
  color: string;
  joinedAt?: Timestamp;
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
    const presenceId = `${documentId}_${userId}`;
    const presenceRef = doc(db, PRESENCE_COLLECTION, presenceId);
    
    const color = generateUserColor(userId);

    await setDoc(presenceRef, {
      documentId,
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
    const presenceId = `${documentId}_${userId}`;
    const presenceRef = doc(db, PRESENCE_COLLECTION, presenceId);
    await deleteDoc(presenceRef);
  } catch (error) {
    console.error("Error removing presence:", error);
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
  const q = query(
    collection(db, PRESENCE_COLLECTION),
    where("documentId", "==", documentId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const users: ActiveUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          userId: data.userId,
          name: data.name,
          color: data.color,
          joinedAt: data.joinedAt,
        });
      });
      onUpdate(users);
    },
    (error) => {
      console.error("Error subscribing to presence:", error);
    }
  );
};
