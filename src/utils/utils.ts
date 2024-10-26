export function formatCurrencyInIDR(amount: number): string {
    const [whole, fractional] = amount.toFixed(2).split(".");
    const wholeWithCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp${wholeWithCommas},${fractional}`;
}