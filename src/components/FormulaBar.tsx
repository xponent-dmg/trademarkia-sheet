"use client";

import { useState, useEffect } from "react";

interface FormulaBarProps {
  selectedCell: string | null;
  cellMap: Record<string, string>;
  onUpdateCell: (cellId: string, value: string) => void;
}

export default function FormulaBar({ selectedCell, cellMap, onUpdateCell }: FormulaBarProps) {
  const [inputValue, setInputValue] = useState("");

  // Update input value when selection changes or underlying cell data changes
  useEffect(() => {
    if (selectedCell) {
      setInputValue(cellMap[selectedCell] || "");
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
    <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-2">
      <div className="font-mono text-sm border bg-white px-2 py-1 rounded min-w-[40px] text-center text-gray-700">
        {selectedCell ? `[${selectedCell}]` : "[ ]"}
      </div>
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
