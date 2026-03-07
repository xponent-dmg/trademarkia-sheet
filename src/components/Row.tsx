import Cell from "./Cell";
import { ActiveUser } from "@/lib/firestorePresence";
import { CellData } from "@/lib/firestoreCells";
import { evaluateFormula } from "@/lib/formula/evaluateFormula";

interface RowProps {
  rowNumber: number;
  columns: string[];
  cellMap: Record<string, CellData>;
  selectionMap: Record<string, ActiveUser>;
  editingCell: string | null;
  editingValue: string;
  onEditingValueChange: (value: string) => void;
  onDoubleClick: (cellId: string) => void;
  onCellBlur: () => void;
  onCellChange: (cellId: string, value: string) => void;
  onCellSelect: (cellId: string) => void;
}

export default function Row({ 
  rowNumber, 
  columns, 
  cellMap, 
  selectionMap, 
  editingCell,
  editingValue,
  onEditingValueChange,
  onDoubleClick,
  onCellBlur,
  onCellChange, 
  onCellSelect 
}: RowProps) {
  return (
    <div className="flex flex-row">
      {/* Row Header */}
      <div className="w-12 h-[32px] bg-gray-100 border-r border-gray-200 flex items-center justify-center font-medium text-gray-600 text-sm flex-shrink-0 sticky left-0 z-10">
        {rowNumber}
      </div>

      {/* Cells */}
      <div className="flex flex-row">
        {columns.map((col) => {
          const cellId = `${col}${rowNumber}`;
          const cellData = cellMap[cellId];
          const value = cellData?.value || "";
          const displayValue = evaluateFormula(value, cellMap);
          const selectedBy = selectionMap[cellId] || null;
          const isEditing = editingCell === cellId;

          return (
            <Cell
              key={cellId}
              cellId={cellId}
              value={value}
              displayValue={displayValue}
              isEditing={isEditing}
              editingValue={isEditing ? editingValue : ""}
              onEditingValueChange={onEditingValueChange}
              onDoubleClick={onDoubleClick}
              onBlur={onCellBlur}
              onChange={onCellChange}
              onSelect={onCellSelect}
              selectedBy={selectedBy}
              bold={cellData?.bold}
              italic={cellData?.italic}
              bgColor={cellData?.bgColor}
            />
          );
        })}
      </div>
    </div>
  );
}
