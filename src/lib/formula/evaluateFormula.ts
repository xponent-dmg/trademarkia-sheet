import { expandRange } from "./expandRange";
import { parseCellRefs } from "./parseCellRefs";
import { CellData } from "../firestoreCells";

// Safe evaluation of mathematical expressions
function safeEval(expression: string): number {
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error("Invalid characters in expression");
  }
  return new Function(`return ${expression}`)();
}

// Recursively resolves a cell to its evaluated string value
function resolveCellValue(
  cellId: string, 
  cellMap: Record<string, CellData>, 
  visited: Set<string>
): string {
  if (visited.has(cellId)) return "#ERROR";
  let cellValue = cellMap[cellId]?.value || "";
  
  if (cellValue.startsWith("=")) {
    const newVisited = new Set(visited);
    newVisited.add(cellId);
    return evaluateFormula(cellValue, cellMap, newVisited);
  }
  
  return cellValue;
}

export function evaluateFormula(
  value: string,
  cellMap: Record<string, CellData>,
  visited = new Set<string>()
): string {
  if (!value || !value.startsWith("=")) {
    return value;
  }

  try {
    const rawFormula = value.substring(1).trim();

    // 1. Handle range functions
    const rangeFuncMatch = rawFormula.match(/^(SUM|PRODUCT|AVG|MIN|MAX|COUNT)\s*\(\s*(.+?)\s*\)$/i);
    if (rangeFuncMatch) {
      const funcName = rangeFuncMatch[1].toUpperCase();
      const cellsInRange = expandRange(rangeFuncMatch[2]);
      
      if (cellsInRange.length === 0) return "#ERROR";

      const numericValues: number[] = [];
      for (const cellId of cellsInRange) {
        const resolved = resolveCellValue(cellId, cellMap, visited);
        if (resolved === "#ERROR") return "#ERROR";
        
        const num = parseFloat(resolved);
        numericValues.push(isNaN(num) ? 0 : num); // Treat empty/invalid as 0
      }

      let result = 0;
      switch (funcName) {
        case "SUM":     result = numericValues.reduce((a, b) => a + b, 0); break;
        case "PRODUCT": result = numericValues.reduce((a, b) => a * b, 1); break;
        case "AVG":     result = numericValues.reduce((a, b) => a + b, 0) / numericValues.length; break;
        case "MIN":     result = Math.min(...numericValues); break;
        case "MAX":     result = Math.max(...numericValues); break;
        case "COUNT":   result = numericValues.length; break;
      }
      return result.toString();
    }

    // 2. Handle standard arithmetic formulas
    let formulaStr = rawFormula;
    const cellRefs = parseCellRefs(formulaStr);

    for (const cellId of cellRefs) {
      const resolved = resolveCellValue(cellId, cellMap, visited);
      if (resolved === "#ERROR") return "#ERROR";

      const numValue = parseFloat(resolved);
      const replaceVal = isNaN(numValue) ? "0" : numValue.toString();

      const regex = new RegExp(`\\b${cellId}\\b`, "gi");
      formulaStr = formulaStr.replace(regex, replaceVal);
    }

    const result = safeEval(formulaStr);
    if (!isFinite(result)) return "#ERROR";

    return result.toString();
  } catch (error) {
    return "#ERROR";
  }
}
