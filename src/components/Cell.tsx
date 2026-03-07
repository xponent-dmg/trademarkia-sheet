"use client";

import { useRef, useEffect } from "react";
import { ActiveUser } from "@/lib/firestorePresence";

interface CellProps {
  cellId: string;
  value: string;
  displayValue?: string; // Additional prop for computed formula value
  isEditing: boolean;
  editingValue: string;
  onEditingValueChange: (value: string) => void;
  onChange: (cellId: string, value: string) => void; // Keep this just in case, though not strictly needed here if we handle commit in Spreadsheet it's fine.
  onDoubleClick: (cellId: string) => void;
  onSelect: (cellId: string) => void;
  selectedBy: ActiveUser | null;
  onBlur: () => void;
}

export default function Cell({ 
  cellId, 
  value, 
  displayValue, 
  isEditing,
  editingValue,
  onEditingValueChange,
  onChange,
  onDoubleClick,
  onSelect, 
  selectedBy,
  onBlur
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  let borderClass = "border border-gray-200";
  let borderStyle = {};

  if (isEditing) {
    borderClass = "border-2 border-blue-500 z-5";
  } else if (selectedBy) {
    borderClass = "border-2 z-10";
    borderStyle = { borderColor: selectedBy.color };
  }

  return (
    <div
      data-cell-id={cellId}
      className={`${borderClass} w-[100px] h-[32px] overflow-hidden bg-white text-sm box-border relative`}
      style={borderStyle}
      onDoubleClick={() => onDoubleClick(cellId)}
      onClick={() => {
        if (!isEditing) onSelect(cellId);
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-1 py-0 outline-none bg-transparent"
          value={editingValue}
          onChange={(e) => onEditingValueChange(e.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <div className="w-full h-full px-1 flex items-center whitespace-nowrap overflow-hidden text-gray-800">
          {displayValue !== undefined ? displayValue : value}
        </div>
      )}
    </div>
  );
}
