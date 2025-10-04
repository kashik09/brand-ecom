export const dec = (v: number | string) =>
  typeof v === "number" ? String(Math.trunc(v)) : v;

export function toUnnestArrays(items: Array<{
  orderId: string;
  productId: string;
  title: string;
  price: number | string;
  qty: number;
  type: string;
}>) {
  return {
    orderIds: items.map(i => i.orderId),
    productIds: items.map(i => i.productId),
    titles: items.map(i => i.title),
    prices: items.map(i => (typeof i.price === "number" ? Math.trunc(i.price) : i.price)),
    qtys: items.map(i => i.qty),
    types: items.map(i => i.type),
  };
}
