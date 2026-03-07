"use client";

import { useState, useRef, useEffect } from "react";

interface CellProps {
  cellId: string;
  value: string;
  onChange: (cellId: string, value: string) => void;
}

export default function Cell({ cellId, value, onChange }: CellProps) {
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

  return (
    <div
      className="border border-gray-200 w-[100px] h-[32px] overflow-hidden bg-white text-sm"
      onDoubleClick={handleDoubleClick}
      onClick={() => {
        if (!isEditing) setIsEditing(true); // Single click also enters edit mode
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-1 py-0 outline-none border-blue-500 border-2"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <div className="w-full h-full px-1 flex items-center whitespace-nowrap overflow-hidden text-gray-800">
          {value}
        </div>
      )}
    </div>
  );
}
