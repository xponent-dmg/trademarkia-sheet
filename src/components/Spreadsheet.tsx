"use client";

import { useState, useEffect } from "react";
import Row from "./Row";
import { useAuth } from "@/context/AuthContext";
import { subscribeToCells, updateCell, deleteCell } from "@/lib/firestoreCells";

interface SpreadsheetProps {
  documentId: string;
}

const ROWS = 20;
const COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function Spreadsheet({ documentId }: SpreadsheetProps) {
  // Sparse cell map: driven entirely by Firestore snapshot
  const [cellMap, setCellMap] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!documentId) return;

    // Subscribe to Firestore changes and update the UI
    const unsubscribe = subscribeToCells(documentId, (newCellMap) => {
      setCellMap(newCellMap);
    });

    return () => unsubscribe();
  }, [documentId]);

  const handleCellChange = async (cellId: string, value: string) => {
    // Determine the trimmed value
    const trimValue = value.trim();
    
    // Write directly to Firestore. The snapshot listener will update cellMap automatically.
    if (trimValue === "") {
      await deleteCell(documentId, cellId);
    } else {
      await updateCell(documentId, cellId, trimValue, user?.uid);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-white border border-gray-300 shadow-sm rounded-md">
      {/* Column Headers */}
      <div className="flex flex-row sticky top-0 z-10 bg-gray-100 border-b border-gray-300">
        {/* Top-left corner cell */}
        <div className="w-12 h-[32px] bg-gray-200 border-r border-gray-300 flex-shrink-0"></div>

        {/* Column headings */}
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="w-[100px] h-[32px] border-r border-gray-300 flex items-center justify-center font-medium text-gray-700 flex-shrink-0"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Grid Rows */}
      <div className="flex flex-col">
        {Array.from({ length: ROWS }).map((_, index) => {
          const rowNumber = index + 1;
          return (
            <Row
              key={rowNumber}
              rowNumber={rowNumber}
              columns={COLUMNS}
              cellMap={cellMap}
              onCellChange={handleCellChange}
            />
          );
        })}
      </div>

      <div className="mt-4 p-4 text-xs text-gray-500 text-left border-t border-gray-200">
        Stored Cells: {Object.keys(cellMap).length}
      </div>
    </div>
  );
}
