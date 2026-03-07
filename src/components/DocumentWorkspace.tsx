"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToCells, updateCell, deleteCell } from "@/lib/firestoreCells";
import { subscribeToPresence, updatePresenceSelection, ActiveUser } from "@/lib/firestorePresence";

import PresenceBar from "./PresenceBar";
import FormulaBar from "./FormulaBar";
import Spreadsheet from "./Spreadsheet";

interface DocumentWorkspaceProps {
  documentId: string;
}

export default function DocumentWorkspace({ documentId }: DocumentWorkspaceProps) {
  // Sparse cell map: driven entirely by Firestore snapshot
  const [cellMap, setCellMap] = useState<Record<string, string>>({});
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [selectedCellLocal, setSelectedCellLocal] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!documentId) return;

    // Subscribe to Firestore changes
    const unsubscribeCells = subscribeToCells(documentId, (newCellMap) => {
      setCellMap(newCellMap);
    });

    const unsubscribePresence = subscribeToPresence(documentId, (users) => {
      setActiveUsers(users);
    });

    return () => {
      unsubscribeCells();
      unsubscribePresence();
    };
  }, [documentId]);

  const handleCellChange = async (cellId: string, value: string) => {
    const trimValue = value.trim();
    if (trimValue === "") {
      await deleteCell(documentId, cellId);
    } else {
      await updateCell(documentId, cellId, trimValue, user?.uid);
    }
  };

  const handleCellSelect = (cellId: string) => {
    if (user?.uid) {
      setSelectedCellLocal(cellId);
      updatePresenceSelection(documentId, user.uid, cellId);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative z-0">
      <PresenceBar documentId={documentId} />
      <FormulaBar 
        selectedCell={selectedCellLocal} 
        cellMap={cellMap} 
        onUpdateCell={handleCellChange} 
      />
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
  );
}
