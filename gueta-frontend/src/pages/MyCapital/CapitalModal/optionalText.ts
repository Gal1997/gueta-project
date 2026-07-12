export function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
