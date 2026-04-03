type CurrencyInput = number | string | null | undefined;

function toNumber(value: CurrencyInput): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function fallbackFormat(amount: number, currency: string): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const fixed = safe.toFixed(2);

  // Minimal, dependency-free fallback (no Indian digit-grouping).
  if (currency.toUpperCase() === "INR") return `₹${fixed}`;
  return `${currency.toUpperCase()} ${fixed}`;
}

export function formatCurrency(
  value: CurrencyInput,
  currency: string = "INR",
): string {
  try {
    const amount = toNumber(value);
    if (!Number.isFinite(amount)) return fallbackFormat(0, currency);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return fallbackFormat(toNumber(value), currency);
  }
}
