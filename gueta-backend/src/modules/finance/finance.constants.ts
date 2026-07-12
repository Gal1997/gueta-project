export const INFINITE_REMAINING_PAYMENTS = -1;
export const REMAINING_PAYMENTS_INFINITE_LABEL = "אין סוף";

export function isInfiniteRemainingPayments(value: number): boolean {
  return value === INFINITE_REMAINING_PAYMENTS;
}
