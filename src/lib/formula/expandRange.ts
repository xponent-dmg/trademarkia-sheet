export function expandRange(range: string): string[] {
  // Expected format: A1:A5 (only same-column ranges need to be supported)
  const parts = range.split(":");
  if (parts.length !== 2) return [];

  const start = parts[0].trim().toUpperCase();
  const end = parts[1].trim().toUpperCase();

  // Extract column letter and row numbers
  const startMatch = start.match(/^([A-Z])(\d+)$/);
  const endMatch = end.match(/^([A-Z])(\d+)$/);

  if (!startMatch || !endMatch) return [];

  const startCol = startMatch[1];
  const startRow = parseInt(startMatch[2], 10);

  const endCol = endMatch[1];
  const endRow = parseInt(endMatch[2], 10);

  // If columns don't match, return empty array as per requirements
  if (startCol !== endCol) return [];

  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const cells: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    cells.push(`${startCol}${r}`);
  }

  return cells;
}
