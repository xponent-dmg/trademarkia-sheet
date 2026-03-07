import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  documentId,
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

/**
 * Fetches a single document by its ID.
 * @param id The ID of the document.
 * @returns The DocumentData or null if not found.
 */
export const getDocument = async (id: string): Promise<DocumentData | null> => {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

/**
 * Updates the title of a document.
 * @param id The ID of the document.
 * @param title The new title.
 */
export const updateDocumentTitle = async (id: string, title: string): Promise<void> => {
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    await updateDoc(docRef, {
      title,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating document title:", error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const { doc, deleteDoc, collection, getDocs, writeBatch } = await import("firebase/firestore");
    
    // 1. Delete the document itself
    const docRef = doc(db, DOCUMENTS_COLLECTION, id);
    await deleteDoc(docRef);

    // 2. Delete all cells for this document
    const cellsRef = collection(db, DOCUMENTS_COLLECTION, id, "cells");
    const cellsSnapshot = await getDocs(cellsRef);
    
    const batch = writeBatch(db);
    cellsSnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 3. Delete presence for this document
    const presenceRef = collection(db, DOCUMENTS_COLLECTION, id, "presence");
    const presenceSnapshot = await getDocs(presenceRef);
    presenceSnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error deleting document and associated data:", error);
    throw error;
  }
};

// ─── Users collection helpers ─────────────────────────────────────────────────

const USERS_COLLECTION = "users";

/**
 * Records that a user opened a document by adding the docId to their
 * `openedDocuments` array (arrayUnion prevents duplicates automatically).
 */
export const recordOpenedDocument = async (
  userId: string,
  docId: string
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    // setDoc with merge:true creates the document if it doesn't exist yet
    await setDoc(userRef, { openedDocuments: arrayUnion(docId) }, { merge: true });
  } catch (error) {
    console.error("Error recording opened document:", error);
    // Non-fatal – don't throw, just log
  }
};

/**
 * Fetches the list of document IDs that a user has previously opened.
 */
export const fetchOpenedDocumentIds = async (
  userId: string
): Promise<string[]> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];
    return (userSnap.data().openedDocuments as string[]) || [];
  } catch (error) {
    console.error("Error fetching opened document ids:", error);
    return [];
  }
};

/**
 * Fetches documents by their Firestore document IDs using the __name__ in query.
 * Firestore allows at most 30 items per `in` array, but that is fine for this use-case.
 */
export const fetchDocumentsByIds = async (
  ids: string[]
): Promise<DocumentData[]> => {
  if (ids.length === 0) return [];

  try {
    // Chunk to <= 30 per Firestore limit
    const chunkSize = 30;
    const results: DocumentData[] = [];

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const q = query(
        collection(db, DOCUMENTS_COLLECTION),
        where(documentId(), "in", chunk)
      );
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        const data = d.data();
        results.push({
          id: d.id,
          title: data.title,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching documents by IDs:", error);
    throw error;
  }
};
