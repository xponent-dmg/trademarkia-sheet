"use client";

import { useState, useEffect } from "react";
import { CellData } from "@/lib/firestoreCells";
import CellFormattingToolbar from "./CellFormattingToolbar";

interface FormulaBarProps {
  selectedCell: string | null;
  cellMap: Record<string, CellData>;
  onUpdateCell: (cellId: string, value: string) => void;
  onUpdateFormatting: (cellId: string, formatting: Partial<CellData>) => void;
}

export default function FormulaBar({ selectedCell, cellMap, onUpdateCell, onUpdateFormatting }: FormulaBarProps) {
  const [inputValue, setInputValue] = useState("");

  // Update input value when selection changes or underlying cell data changes
  useEffect(() => {
    if (selectedCell) {
      setInputValue(cellMap[selectedCell]?.value || "");
    } else {
      setInputValue("");
    }
  }, [selectedCell, cellMap]);

  const handleBlur = () => {
    if (selectedCell) {
      onUpdateCell(selectedCell, inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (selectedCell) {
        onUpdateCell(selectedCell, inputValue);
      }
      // blur the input target to mimic excel
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-center gap-5 w-full">
      <div className="font-mono text-sm border border-gray-400 bg-white px-3 py-1 rounded-md min-w-[40px] text-center text-gray-700">
        {selectedCell ? `[${selectedCell}]` : "[ ]"}
      </div>

      <CellFormattingToolbar 
        selectedCell={selectedCell}
        cellMap={cellMap}
        onUpdateFormatting={onUpdateFormatting}
      />

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-600 font-medium italic text-sm">
        fx
      </div>
      <input
        type="text"
        className="flex-1 border bg-white px-3 py-1 rounded outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={!selectedCell}
        placeholder={selectedCell ? "Enter value or formula" : ""}
      />
    </div>
  );
}
