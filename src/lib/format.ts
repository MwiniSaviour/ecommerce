export function formatPrice(amount: number) {
  return `GH₵ ${new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 }).format(amount)}`;
}
