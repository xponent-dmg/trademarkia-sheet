"use client";

import { useState, useRef, useEffect } from "react";
import Row from "./Row";
import { ActiveUser } from "@/lib/firestorePresence";
import { CellData } from "@/lib/firestoreCells";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SpreadsheetProps {
  documentId: string;
  cellMap: Record<string, CellData>;
  activeUsers: ActiveUser[];
  selectedCellLocal: string | null;
  onCellChange: (cellId: string, value: string) => void;
  onCellSelect: (cellId: string) => void;
  userUid?: string;
}

const ROWS = 100;
const COLUMNS = Array.from({ length: 26}, (_, i) => String.fromCharCode(65 + i));
const DEFAULT_COLUMN_WIDTH = 120;
const MIN_COLUMN_WIDTH = 60;

export default function Spreadsheet({ 
  documentId,
  cellMap,
  activeUsers,
  selectedCellLocal,
  onCellChange,
  onCellSelect,
  userUid
}: SpreadsheetProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(COLUMNS);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectionMap = activeUsers.reduce((acc, activeUser) => {
    // Use local selection state for instantaneous feedback for current user
    const selectedCell = activeUser.userId === userUid && selectedCellLocal !== null
      ? selectedCellLocal
      : activeUser.selectedCell;

    if (selectedCell) {
      acc[selectedCell] = activeUser;
    }
    return acc;
  }, {} as Record<string, ActiveUser>);

  useEffect(() => {
    if (selectedCellLocal && containerRef.current) {
      const cellElement = containerRef.current.querySelector(
        `[data-cell-id="${selectedCellLocal}"]`
      );
      if (cellElement) {
        cellElement.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [selectedCellLocal]);

  useEffect(() => {
    if (!documentId) return;
    const docRef = doc(db, "documents", documentId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setColumnWidths(data.columnWidths || {});
        setColumnOrder(data.columnOrder || COLUMNS);
      }
    });
    return () => unsubscribe();
  }, [documentId]);

  const handleResizeMouseDown = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startWidth = columnWidths[column] || DEFAULT_COLUMN_WIDTH;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + deltaX);
      setColumnWidths(prev => ({
        ...prev,
        [column]: newWidth
      }));
    };

    const onMouseUp = async (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      
      const deltaX = upEvent.clientX - startX;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + deltaX);
      
      try {
        const docRef = doc(db, "documents", documentId);
        await updateDoc(docRef, {
          [`columnWidths.${column}`]: newWidth
        });
      } catch (error) {
        console.error("Error updating column width:", error);
      }
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, col: string) => {
    e.dataTransfer.setData("text/plain", col);
    // Optional: set drag image or effect
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetCol: string) => {
    e.preventDefault();
    const sourceCol = e.dataTransfer.getData("text/plain");

    if (sourceCol && sourceCol !== targetCol) {
      const newOrder = [...columnOrder];
      const sourceIndex = newOrder.indexOf(sourceCol);
      const targetIndex = newOrder.indexOf(targetCol);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        // Remove from old position
        newOrder.splice(sourceIndex, 1);
        // Insert at new position
        newOrder.splice(targetIndex, 0, sourceCol);
        
        // Optimistic update
        setColumnOrder(newOrder);

        // Firestore update
        try {
          const docRef = doc(db, "documents", documentId);
          await updateDoc(docRef, {
            columnOrder: newOrder
          });
        } catch (error) {
          console.error("Error reordering columns:", error);
        }
      }
    }
  };

  const commitEdit = () => {
    if (editingCell) {
      onCellChange(editingCell, editingValue);
      setEditingCell(null);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const handleDoubleClick = (cellId: string) => {
    setEditingCell(cellId);
    setEditingValue(cellMap[cellId]?.value || "");
  };

  const handleCellBlur = () => {
    commitEdit();
  };

  const extractCellId = (cellId: string): [number, number] => {
    const colMatch = cellId.match(/^[A-Z]+/);
    const rowMatch = cellId.match(/\d+$/);
    if (!colMatch || !rowMatch) return [0, 1];
    const colIndex = columnOrder.indexOf(colMatch[0]);
    const rowIndex = parseInt(rowMatch[0], 10);
    return [colIndex === -1 ? 0 : colIndex, rowIndex];
  };

  const moveSelection = (startCell: string, direction: "up" | "down" | "left" | "right") => {
    const [colIndex, row] = extractCellId(startCell);
    let newColIndex = colIndex;
    let newRow = row;

    if (direction === "up") newRow = Math.max(1, row - 1);
    if (direction === "down") newRow = Math.min(ROWS, row + 1);
    if (direction === "left") newColIndex = Math.max(0, colIndex - 1);
    if (direction === "right") newColIndex = Math.min(columnOrder.length - 1, colIndex + 1);

    if (newColIndex !== colIndex || newRow !== row) {
      onCellSelect(`${columnOrder[newColIndex]}${newRow}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isEditing = editingCell !== null;
    
    const isPrintableKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (isEditing) {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
        moveSelection(editingCell, "down");
        containerRef.current?.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitEdit();
        // Support Shift+Tab mapping to left if user holds shift
        moveSelection(editingCell, e.shiftKey ? "left" : "right");
        containerRef.current?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
        containerRef.current?.focus();
      }
      return; 
    }

    if (!selectedCellLocal) return;

    if (isPrintableKey) {
      setEditingCell(selectedCellLocal);
      setEditingValue(e.key);
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      setEditingCell(selectedCellLocal);
      setEditingValue(cellMap[selectedCellLocal]?.value || "");
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
      e.preventDefault();
      
      let direction: "up" | "down" | "left" | "right" = "right";
      if (e.key === "ArrowUp") direction = "up";
      if (e.key === "ArrowDown") direction = "down";
      if (e.key === "ArrowLeft") direction = "left";
      if (e.key === "ArrowRight" || e.key === "Tab") direction = "right";

      if (e.key === "Tab" && e.shiftKey) {
        direction = "left";
      }

      moveSelection(selectedCellLocal, direction);
    }
    
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      if (cellMap[selectedCellLocal]) {
        onCellChange(selectedCellLocal, ""); 
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto bg-white border border-gray-300 shadow-sm rounded-md outline-none relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Column Headers */}
      <div className="flex flex-row sticky top-0 z-25 bg-gray-100 border-b border-gray-300 min-w-max">
        {/* Top-left corner cell */}
        <div className="w-12 h-[32px] bg-gray-200 border-r border-gray-300 flex-shrink-0 sticky left-0 z-30"></div>

        {/* Column headings */}
        {columnOrder.map((col, index) => {
          const width = columnWidths[col] || DEFAULT_COLUMN_WIDTH;
          const displayAlphabet = COLUMNS[index]; // Display standard A, B, C regardless of underlying ID
          return (
            <div
              key={col}
              className="h-[32px] border-r border-gray-300 flex items-center justify-center font-medium text-gray-700 flex-shrink-0 relative select-none group focus:outline-none"
              style={{ width: `${width}px`, minWidth: `${width}px` }}
              draggable
              onDragStart={(e) => handleDragStart(e, col)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="w-full text-center cursor-grab py-1">{displayAlphabet}</div>
              {/* Resize Handle */}
              <div
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity z-10"
                onMouseDown={(e) => handleResizeMouseDown(e, col)}
              />
            </div>
          );
        })}
      </div>

      {/* Grid Rows */}
      <div className="flex flex-col min-w-max pb-16">
        {Array.from({ length: ROWS }).map((_, index) => {
          const rowNumber = index + 1;
          return (
            <Row
              key={rowNumber}
              rowNumber={rowNumber}
              columns={columnOrder}
              cellMap={cellMap}
              selectionMap={selectionMap}
              editingCell={editingCell}
              editingValue={editingValue}
              onEditingValueChange={setEditingValue}
              onDoubleClick={handleDoubleClick}
              onCellBlur={handleCellBlur}
              onCellSelect={onCellSelect}
              columnWidths={columnWidths}
            />
          );
        })}
      </div>
    </div>
  );
}
