const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** $128 for whole dollars, $128.40 otherwise. */
export const money = (n: number) => (Number.isInteger(n) ? usd0.format(n) : usd2.format(n));
export const money2 = (n: number) => usd2.format(n);

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
