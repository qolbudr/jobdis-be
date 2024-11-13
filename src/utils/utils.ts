export function formatCurrencyInIDR(amount: number): string {
    const [whole, fractional] = amount.toFixed(2).split(".");
    const wholeWithCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp${wholeWithCommas},${fractional}`;
}

interface MbtiObject {
    [key: string]: any;
  }

export const mbtiMapping : MbtiObject = {
    I: "Introvert", 
    S: "Sensing", 
    T: "Thinking",
    J: "Judging",
    E: "Extrovert",
    N: "Intuition",
    F: "Feeling",
    P: "Perceiving"
}