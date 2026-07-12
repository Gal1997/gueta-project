export const MONEY_DECIMAL_SCALE = 2;

export function roundMoney(amount: number): number {
  const factor = 10 ** MONEY_DECIMAL_SCALE;
  return Math.round(amount * factor) / factor;
}
