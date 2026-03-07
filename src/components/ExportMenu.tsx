"use client";

import { useState, useRef, useEffect } from "react";
import { CellData } from "@/lib/firestoreCells";
import { exportCSV } from "@/lib/export/exportCSV";
import { exportExcel } from "@/lib/export/exportExcel";

const ROWS = 100;
const COLS = 26;

interface ExportMenuProps {
  cellMap: Record<string, CellData>;
  columnWidths: Record<string, number>;
}

export default function ExportMenu({ cellMap, columnWidths }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleExportExcel = () => {
    setOpen(false);
    exportExcel({ cellMap, columnWidths, rows: ROWS, cols: COLS });
  };

  const handleExportCSV = () => {
    setOpen(false);
    exportCSV({ cellMap, columnWidths, rows: ROWS, cols: COLS });
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors absoulz-[9999]"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] py-1">
          <button
            onClick={handleExportExcel}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-green-600 font-bold text-xs bg-green-50 border border-green-200 rounded px-1 py-0.5 leading-tight">
              XLS
            </span>
            Excel (.xlsx)
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-blue-600 font-bold text-xs bg-blue-50 border border-blue-200 rounded px-1 py-0.5 leading-tight">
              CSV
            </span>
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
