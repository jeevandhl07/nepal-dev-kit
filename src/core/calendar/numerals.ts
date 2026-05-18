const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

export function formatWithDevanagariDigits(
  value: number | string,
  devanagari: boolean = false,
): string {
  const text = String(value);
  if (!devanagari) {
    return text;
  }

  return text.replace(/\d/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}
