import Cell from "./Cell";
import { ActiveUser } from "@/lib/firestorePresence";

interface RowProps {
  rowNumber: number;
  columns: string[];
  cellMap: Record<string, string>;
  selectionMap: Record<string, ActiveUser>;
  onCellChange: (cellId: string, value: string) => void;
  onCellSelect: (cellId: string) => void;
}

export default function Row({ rowNumber, columns, cellMap, selectionMap, onCellChange, onCellSelect }: RowProps) {
  return (
    <div className="flex flex-row">
      {/* Row Header */}
      <div className="w-12 h-[32px] bg-gray-100 border border-gray-200 flex items-center justify-center font-medium text-gray-600 text-sm flex-shrink-0">
        {rowNumber}
      </div>

      {/* Cells */}
      <div className="flex flex-row">
        {columns.map((col) => {
          const cellId = `${col}${rowNumber}`;
          const value = cellMap[cellId] || "";
          const selectedBy = selectionMap[cellId] || null;

          return (
            <Cell
              key={cellId}
              cellId={cellId}
              value={value}
              onChange={onCellChange}
              onSelect={onCellSelect}
              selectedBy={selectedBy}
            />
          );
        })}
      </div>
    </div>
  );
}
