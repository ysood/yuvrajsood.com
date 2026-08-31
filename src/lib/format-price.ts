export const formatPrice = (price: number) =>
  `$${new Intl.NumberFormat("en-AU", {
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price)}`;
