"use client";

import { useState, useRef, useEffect } from "react";
import { CellData } from "@/lib/firestoreCells";

interface CellFormattingToolbarProps {
  selectedCell: string | null;
  cellMap: Record<string, CellData>;
  onUpdateFormatting: (cellId: string, formatting: Partial<CellData>) => void;
}

const PRESET_COLORS = [
  "#ffffff", // white
  "#fef3c7", // light yellow
  "#dcfce7", // light green
  "#dbeafe", // light blue
  "#fee2e2", // light red
];

export default function CellFormattingToolbar({
  selectedCell,
  cellMap,
  onUpdateFormatting,
}: CellFormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const cellData = selectedCell ? cellMap[selectedCell] : null;
  const isBold = cellData?.bold || false;
  const isItalic = cellData?.italic || false;
  const bgColor = cellData?.bgColor || "#ffffff";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleBold = () => {
    if (selectedCell) {
      onUpdateFormatting(selectedCell, { bold: !isBold });
    }
  };

  const handleToggleItalic = () => {
    if (selectedCell) {
      onUpdateFormatting(selectedCell, { italic: !isItalic });
    }
  };

  const handleColorSelect = (color: string) => {
    if (selectedCell) {
      onUpdateFormatting(selectedCell, { bgColor: color === "#ffffff" ? "" : color });
    }
    setShowColorPicker(false);
  };

  return (
    <div className="flex items-center gap-1 border px-2 mx-1 border-gray-300 rounded-full">
      <button
        onClick={handleToggleBold}
        disabled={!selectedCell}
        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${
          !selectedCell 
            ? "text-gray-300 cursor-not-allowed" 
            : isBold 
              ? "bg-gray-200 text-gray-900 shadow-inner" 
              : "text-gray-700 hover:bg-gray-100"
        }`}
        title="Bold"
      >
        B
      </button>

      <button
        onClick={handleToggleItalic}
        disabled={!selectedCell}
        className={`w-8 h-8 flex items-center justify-center rounded text-sm italic font-serif transition-colors ${
          !selectedCell 
            ? "text-gray-300 cursor-not-allowed" 
            : isItalic 
              ? "bg-gray-200 text-gray-900 shadow-inner" 
              : "text-gray-700 hover:bg-gray-100"
        }`}
        title="Italic"
      >
        I
      </button>

      <div className="relative" ref={colorPickerRef}>
        <button
          onClick={() => selectedCell && setShowColorPicker(!showColorPicker)}
          disabled={!selectedCell}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors relative ${
            !selectedCell ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"
          }`}
          title="Background Color"
        >
          🎨
          {bgColor && bgColor !== "#ffffff" && (
            <div 
              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: bgColor }}
            />
          )}
        </button>

        {showColorPicker && (
          <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2 border-box">
            <div className="text-xs text-gray-500 font-medium mb-2 px-1">Presets</div>
            <div className="grid grid-cols-5 gap-1 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-5 h-5 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform ${
                    bgColor === color ? "ring-2 ring-blue-400 ring-offset-1" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            
            <div className="text-xs text-gray-500 font-medium mb-2 px-1 border-t pt-2 border-gray-100">Custom color</div>
            <div className="flex items-center justify-center w-full">
                <input
                  type="color"
                  value={bgColor || "#ffffff"}
                  onChange={(e) => {
                    if (selectedCell) {
                      onUpdateFormatting(selectedCell, { bgColor: e.target.value })
                    }
                  }}
                  className="w-full h-8 cursor-pointer border-0 rounded p-0 m-0 custom-color-input"
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
