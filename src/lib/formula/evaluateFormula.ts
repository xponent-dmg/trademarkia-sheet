import { expandRange } from "./expandRange";
import { parseCellRefs } from "./parseCellRefs";

// Safe evaluation of mathematical expressions
function safeEval(expression: string): number {
  // Only allow numbers, basic math operators, decimals, spaces, and parens
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error("Invalid characters in expression");
  }

  // Use Function instead of eval, which is slightly safer, though still runs code.
  // The regex check above ensures it's only math.
  return new Function(`return ${expression}`)();
}

export function evaluateFormula(
  value: string,
  cellMap: Record<string, string>,
  visited = new Set<string>()
): string {
  // 1. If value does not start with "=", return the value unchanged.
  if (!value || !value.startsWith("=")) {
    return value;
  }

  try {
    const rawFormula = value.substring(1).trim();

    // 2. If the formula starts with =SUM(
    if (rawFormula.toUpperCase().startsWith("SUM(")) {
      const match = rawFormula.match(/^SUM\s*\(\s*(.+?)\s*\)$/i);
      if (!match) return "#ERROR";

      const rangeStr = match[1];
      const cellsInRange = expandRange(rangeStr);

      if (cellsInRange.length === 0) return "#ERROR";

      let sum = 0;
      for (const cellId of cellsInRange) {
        // Prevent infinite loops
        if (visited.has(cellId)) return "#ERROR";

        let cellValue = cellMap[cellId] || "";
        
        // If the referenced cell has a formula, evaluate it recursively
        if (cellValue.startsWith("=")) {
          const newVisited = new Set(visited);
          newVisited.add(cellId);
          cellValue = evaluateFormula(cellValue, cellMap, newVisited);
          if (cellValue === "#ERROR") return "#ERROR";
        }

        const numericValue = parseFloat(cellValue);
        // Treat empty or non-numeric as 0
        sum += isNaN(numericValue) ? 0 : numericValue;
      }
      return sum.toString();
    }

    // 3. Otherwise treat the expression as an arithmetic formula
    let formulaStr = rawFormula;
    const cellRefs = parseCellRefs(formulaStr);

    for (const cellId of cellRefs) {
      if (visited.has(cellId)) return "#ERROR"; // Circular reference

      let cellValue = cellMap[cellId] || "";

      // recursive evaluation
      if (cellValue.startsWith("=")) {
        const newVisited = new Set(visited);
        newVisited.add(cellId);
        cellValue = evaluateFormula(cellValue, cellMap, newVisited);
        if (cellValue === "#ERROR") return "#ERROR";
      }

      // If empty or non-numeric, treat as 0
      const numValue = parseFloat(cellValue);
      const replaceVal = isNaN(numValue) ? "0" : numValue.toString();

      // Replace all occurrences of the cellId in the formula
      // Use regex with word boundary to safely replace (e.g. A1 out of A10)
      const regex = new RegExp(`\\b${cellId}\\b`, "gi");
      formulaStr = formulaStr.replace(regex, replaceVal);
    }

    // After replacement, evaluate
    const result = safeEval(formulaStr);
    
    // Check for Infinity / NaN which happens on divide by zero etc
    if (!isFinite(result)) return "#ERROR";

    return result.toString();
  } catch (error) {
    return "#ERROR";
  }
}
