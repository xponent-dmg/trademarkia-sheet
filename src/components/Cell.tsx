"use client";

import { useState, useRef, useEffect } from "react";

import { ActiveUser } from "@/lib/firestorePresence";

interface CellProps {
  cellId: string;
  value: string;
  displayValue?: string; // Additional prop for computed formula value
  onChange: (cellId: string, value: string) => void;
  onSelect: (cellId: string) => void;
  selectedBy: ActiveUser | null;
}

export default function Cell({ cellId, value, displayValue, onChange, onSelect, selectedBy }: CellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Sync internal edit value with external value if it changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(cellId, editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value); // Revert to original
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(cellId, editValue);
  };

  let borderClass = "border border-gray-200";
  let borderStyle = {};

  if (isEditing) {
    borderClass = "border-2 border-blue-500";
  } else if (selectedBy) {
    borderClass = "border-2";
    borderStyle = { borderColor: selectedBy.color };
  }

  return (
    <div
      className={`${borderClass} w-[100px] h-[32px] overflow-hidden bg-white text-sm box-border`}
      style={borderStyle}
      onDoubleClick={handleDoubleClick}
      onClick={() => {
        if (!isEditing) onSelect(cellId);
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-1 py-0 outline-none bg-transparent"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <div className="w-full h-full px-1 flex items-center whitespace-nowrap overflow-hidden text-gray-800">
          {displayValue !== undefined ? displayValue : value}
        </div>
      )}
    </div>
  );
}
