import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const CELLS_COLLECTION = "cells";

/**
 * Subscribes to realtime updates for all cells in a document.
 * @param documentId The ID of the document.
 * @param onUpdate Callback function that receives the new cellMap.
 * @returns Unsubscribe function to stop listening.
 */
export const subscribeToCells = (
  documentId: string,
  onUpdate: (cellMap: Record<string, string>) => void
) => {
  const q = query(
    collection(db, CELLS_COLLECTION),
    where("documentId", "==", documentId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newCellMap: Record<string, string> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.cell && data.value) {
        newCellMap[data.cell] = data.value;
      }
    });
    // Replace the entire map with the current snapshot from Firestore
    onUpdate(newCellMap);
  }, (error) => {
    console.error("Error subscribing to cells:", error);
  });

  return unsubscribe;
};

/**
 * Updates or creates a cell document in Firestore.
 * @param documentId The ID of the document.
 * @param cellId The ID of the cell (e.g., "A1").
 * @param value The value of the cell.
 * @param userId The UID of the user making the update.
 */
export const updateCell = async (
  documentId: string,
  cellId: string,
  value: string,
  userId: string | undefined
) => {
  try {
    const docId = `${documentId}_${cellId}`;
    const cellRef = doc(db, CELLS_COLLECTION, docId);
    
    await setDoc(cellRef, {
      documentId,
      cell: cellId,
      value,
      updatedBy: userId || "anonymous",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating cell ${cellId}:`, error);
  }
};

/**
 * Deletes a cell document from Firestore (used when a cell is cleared).
 * @param documentId The ID of the document.
 * @param cellId The ID of the cell (e.g., "A1").
 */
export const deleteCell = async (documentId: string, cellId: string) => {
  try {
    const docId = `${documentId}_${cellId}`;
    const cellRef = doc(db, CELLS_COLLECTION, docId);
    
    await deleteDoc(cellRef);
  } catch (error) {
    console.error(`Error deleting cell ${cellId}:`, error);
  }
};
