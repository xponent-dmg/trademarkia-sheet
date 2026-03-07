export function parseCellRefs(expression: string): string[] {
  // Regex to match a cell reference like A1, B12, J20
  // It matches a single capital letter A-J and a number 1-20
  // use word boundaries \b to ensure it's not part of a larger word, though cells are typically isolated
  // in simple expression strings. We capture [A-J](?:[1-9]|1[0-9]|20)
  
  const matches = expression.match(/[A-J](?:[1-9]|1[0-9]|20)\b/gi);
  
  if (!matches) return [];

  // Return unique uppercase references
  const uniqueRefs = Array.from(new Set(matches.map((m) => m.toUpperCase())));
  return uniqueRefs;
}
