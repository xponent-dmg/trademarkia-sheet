import { CellData } from "@/lib/firestoreCells";
import { evaluateFormula } from "@/lib/formula/evaluateFormula";

interface ExportCSVParams {
  cellMap: Record<string, CellData>;
  columnWidths: Record<string, number>;
  rows: number;
  cols: number;
}

/**
 * Escapes a CSV field value per RFC 4180.
 * Wraps in double-quotes if the value contains commas, newlines, or double-quotes.
 */
function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exports the spreadsheet as a CSV file and triggers a browser download.
 * Uses computed (evaluated) values instead of raw formulas.
 */
export function exportCSV({ cellMap, rows, cols }: ExportCSVParams): void {
  const csvRows: string[] = [];

  for (let row = 1; row <= rows; row++) {
    const rowValues: string[] = [];

    for (let colIndex = 0; colIndex < cols; colIndex++) {
      const colLetter = String.fromCharCode(65 + colIndex);
      const cellId = `${colLetter}${row}`;
      const rawValue = cellMap[cellId]?.value || "";
      const computedValue = evaluateFormula(rawValue, cellMap);
      rowValues.push(escapeCSVField(computedValue));
    }

    csvRows.push(rowValues.join(","));
  }

  const csvContent = csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "spreadsheet.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
