/*
 * US dollars without Intl: building a NumberFormat costs a phone several ms during hydration,
 * and prices are rendered by the hundred. Same output as en-US currency formatting.
 */
const usd = (n: number, cents: boolean) => {
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(cents ? 2 : 0);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}$${grouped}${dec ? "." + dec : ""}`;
};

/** $128 for whole dollars, $128.40 otherwise. */
export const money = (n: number) => usd(n, !Number.isInteger(n));
export const money2 = (n: number) => usd(n, true);

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
