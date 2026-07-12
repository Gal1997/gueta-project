export function normalizeInvestmentUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidInvestmentUrl(value: string): boolean {
  const normalized = normalizeInvestmentUrl(value);
  if (!normalized) return true;

  try {
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}
