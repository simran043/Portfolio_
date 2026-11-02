export interface LoanResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principalPct: number;
  interestPct: number;
}

/**
 * Standard reducing-balance EMI: P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), with r the monthly rate.
 * EMI is rounded to the rupee, and totals are based on the rounded EMI.
 */
export function calculateLoan(principal: number, annualRatePct: number, months: number): LoanResult {
  const r = annualRatePct / 12 / 100;
  let emi = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  if (!Number.isFinite(emi)) emi = principal / months;
  const roundedEmi = Math.round(emi);

  const totalPayment = roundedEmi * months;
  const totalInterest = Math.max(0, totalPayment - principal);
  const principalPct = Math.round((principal / totalPayment) * 100);

  return {
    emi: roundedEmi,
    totalPayment,
    totalInterest: Math.round(totalInterest),
    principalPct,
    interestPct: 100 - principalPct,
  };
}

export const formatINR = (value: number) => '₹' + value.toLocaleString('en-IN');
