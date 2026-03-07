import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const DOCUMENTS_COLLECTION = "documents";
const CELLS_SUBCOLLECTION = "cells";

export interface CellData {
  value: string;
  bold?: boolean;
  italic?: boolean;
  bgColor?: string;
}

/**
 * Subscribes to realtime updates for all cells in a document.
 * @param documentId The ID of the document.
 * @param onUpdate Callback function that receives the new cellMap.
 * @returns Unsubscribe function to stop listening.
 */
export const subscribeToCells = (
  documentId: string,
  onUpdate: (cellMap: Record<string, CellData>) => void
) => {
  const cellsRef = collection(db, DOCUMENTS_COLLECTION, documentId, CELLS_SUBCOLLECTION);

  const unsubscribe = onSnapshot(cellsRef, (snapshot) => {
    const newCellMap: Record<string, CellData> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.value !== undefined) {
        newCellMap[docSnap.id] = {
          value: data.value,
          bold: data.bold,
          italic: data.italic,
          bgColor: data.bgColor
        };
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
  data: Partial<CellData>,
  userId: string | undefined
) => {
  try {
    const cellRef = doc(db, DOCUMENTS_COLLECTION, documentId, CELLS_SUBCOLLECTION, cellId);
    
    await setDoc(cellRef, {
      ...data,
      updatedBy: userId || "anonymous",
      updatedAt: serverTimestamp(),
    }, { merge: true });
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
    const cellRef = doc(db, DOCUMENTS_COLLECTION, documentId, CELLS_SUBCOLLECTION, cellId);
    
    await deleteDoc(cellRef);
  } catch (error) {
    console.error(`Error deleting cell ${cellId}:`, error);
  }
};
