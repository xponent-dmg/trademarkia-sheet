import * as XLSX from "xlsx-js-style";
import { CellData } from "@/lib/firestoreCells";
import { evaluateFormula } from "@/lib/formula/evaluateFormula";

interface ExportExcelParams {
  cellMap: Record<string, CellData>;
  columnWidths: Record<string, number>;
  rows: number;
  cols: number;
}

/**
 * Exports the spreadsheet as an Excel (.xlsx) file and triggers a browser download.
 * Preserves computed values, bold/italic formatting, background colors, and column widths.
 */
export function exportExcel({ cellMap, columnWidths, rows, cols }: ExportExcelParams): void {
  const ws: Record<string, unknown> = {};

  for (let row = 1; row <= rows; row++) {
    for (let colIndex = 0; colIndex < cols; colIndex++) {
      const colLetter = String.fromCharCode(65 + colIndex);
      const cellId = `${colLetter}${row}`;
      const address = cellId;

      const cell = cellMap[cellId];
      const rawValue = cell?.value || "";
      const computedValue = evaluateFormula(rawValue, cellMap);

      const styleFont: Record<string, boolean> = {};
      if (cell?.bold) styleFont.bold = true;
      if (cell?.italic) styleFont.italic = true;

      const cellObj: Record<string, unknown> = {
        v: computedValue,
        t: "s",
        s: {
          font: styleFont,
          ...(cell?.bgColor
            ? {
                fill: {
                  patternType: "solid",
                  fgColor: { rgb: cell.bgColor.replace("#", "") },
                },
              }
            : {}),
        },
      };

      ws[address] = cellObj;
    }
  }

  // Set worksheet range
  const lastColLetter = String.fromCharCode(64 + cols);
  ws["!ref"] = `A1:${lastColLetter}${rows}`;

  // Set column widths (pixels → Excel character-width approximation via wpx)
  const colWidths: { wpx: number }[] = [];
  for (let colIndex = 0; colIndex < cols; colIndex++) {
    const colLetter = String.fromCharCode(65 + colIndex);
    const widthPx = columnWidths[colLetter] || 120;
    colWidths.push({ wpx: widthPx });
  }
  ws["!cols"] = colWidths;

  // Build workbook and trigger download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws as XLSX.WorkSheet, "Sheet1");
  XLSX.writeFile(wb, "spreadsheet.xlsx");
}
