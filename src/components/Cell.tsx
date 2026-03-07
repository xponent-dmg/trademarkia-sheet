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
  bold?: boolean;
  italic?: boolean;
  bgColor?: string;
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
  onBlur,
  bold,
  italic,
  bgColor
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  let borderClass = "border border-gray-200";
  let borderStyle: React.CSSProperties = {};

  if (isEditing) {
    borderClass = "border-2 z-20";
    if (selectedBy) {
      borderStyle = { borderColor: selectedBy.color };
    } else {
      borderClass += " border-blue-500";
    }
  } else if (selectedBy) {
    borderClass = "border-2 z-10";
    borderStyle = { borderColor: selectedBy.color };
  }

  const containerStyle: React.CSSProperties = {
    ...borderStyle,
    fontWeight: bold ? "bold" : "normal",
    fontStyle: italic ? "italic" : "normal",
    backgroundColor: bgColor || "transparent",
  };

  return (
    <div
      data-cell-id={cellId}
      className={`${borderClass} w-[100px] h-[32px] overflow-hidden bg-white text-sm box-border relative`}
      style={containerStyle}
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
