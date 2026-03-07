"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToCells, updateCell, deleteCell, CellData } from "@/lib/firestoreCells";
import { recordOpenedDocument } from "@/lib/firestore";
import { 
  addPresence, 
  removePresence, 
  subscribeToPresence, 
  updatePresenceSelection, 
  updateHeartbeat,
  ActiveUser 
} from "@/lib/firestorePresence";

import FormulaBar from "./FormulaBar";
import Spreadsheet from "./Spreadsheet";

interface DocumentWorkspaceProps {
  documentId: string;
}

export default function DocumentWorkspace({ documentId }: DocumentWorkspaceProps) {
  // Sparse cell map: driven entirely by Firestore snapshot
  const [cellMap, setCellMap] = useState<Record<string, CellData>>({});
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [selectedCellLocal, setSelectedCellLocal] = useState<string | null>(null);
  const { user } = useAuth();

  // Record that the current user opened this document (for Shared Documents feature)
  useEffect(() => {
    if (!documentId || !user) return;
    recordOpenedDocument(user.uid, documentId);
  }, [documentId, user]);

  useEffect(() => {
    if (!documentId || !user) return;

    // Presence initialization
    addPresence(documentId, user.uid, user.displayName || "Anonymous");

    const handleBeforeUnload = () => {
      removePresence(documentId, user.uid);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const heartbeatInterval = setInterval(() => {
      updateHeartbeat(documentId, user.uid);
    }, 10000);

    // Subscribe to Firestore changes
    const unsubscribeCells = subscribeToCells(documentId, (newCellMap) => {
      setCellMap(newCellMap);
    });

    const unsubscribePresence = subscribeToPresence(documentId, (users) => {
      setActiveUsers(users);
    });

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      removePresence(documentId, user.uid);
      unsubscribeCells();
      unsubscribePresence();
    };
  }, [documentId, user]);

  const handleCellChange = async (cellId: string, value: string) => {
    const trimValue = value.trim();
    if (trimValue === "") {
      // Only delete if formatting is also empty? 
      // For simplicity let's just delete the whole cell if value is empty 
      // unless there comes formatting, but standard spreadsheets clear value but keep formatting.
      // We will implement clearing the value but keeping formatting here.
      const currentCell = cellMap[cellId];
      if (currentCell && (currentCell.bold || currentCell.italic || currentCell.bgColor)) {
        await updateCell(documentId, cellId, { value: trimValue }, user?.uid);
      } else {
        await deleteCell(documentId, cellId);
      }
    } else {
      await updateCell(documentId, cellId, { value: trimValue }, user?.uid);
    }
  };

  const handleUpdateFormatting = async (cellId: string, formatting: Partial<CellData>) => {
    const currentCell = cellMap[cellId];
    if (!currentCell && formatting) {
       // if cell doesn't exist yet but user applies formatting
       await updateCell(documentId, cellId, { value: "", ...formatting }, user?.uid);
    } else {
       await updateCell(documentId, cellId, formatting, user?.uid);
    }
  };

  const handleCellSelect = (cellId: string) => {
    if (user?.uid) {
      setSelectedCellLocal(cellId);
      updatePresenceSelection(documentId, user.uid, cellId);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-max relative z-0">
      
      {/* Unified Top Toolbar */}
      <div className="flex items-center bg-white border-b border-gray-200 px-2 py-1 gap-2 w-full relative z-50">
        <FormulaBar 
          selectedCell={selectedCellLocal} 
          cellMap={cellMap} 
          onUpdateCell={handleCellChange}
          onUpdateFormatting={handleUpdateFormatting}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden relative mt-2">
        <Spreadsheet 
          documentId={documentId}
          cellMap={cellMap}
          activeUsers={activeUsers}
          selectedCellLocal={selectedCellLocal}
          onCellChange={handleCellChange}
          onCellSelect={handleCellSelect}
          userUid={user?.uid}
        />
      </div>
    </div>
  );
}
