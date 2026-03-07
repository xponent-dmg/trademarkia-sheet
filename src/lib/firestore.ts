import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface DocumentData {
  id: string; // The Firestore document ID
  title: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const DOCUMENTS_COLLECTION = "documents";

/**
 * Creates a new spreadsheet document in Firestore.
 * @param userId The UID of the user creating the document.
 * @returns The newly created document ID.
 */
export const createDocument = async (userId: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      title: "Untitled Spreadsheet",
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

/**
 * Fetches all spreadsheet documents created by a specific user.
 * @param userId The UID of the user.
 * @returns An array of DocumentData objects.
 */
export const fetchDocuments = async (userId: string): Promise<DocumentData[]> => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("createdBy", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    title: data.title,
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
});
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error; // Let the caller handle UI state (e.g., showing an error message)
  }
};
