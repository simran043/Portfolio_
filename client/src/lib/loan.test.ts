import { describe, expect, it } from 'vitest';
import { calculateLoan, formatINR } from './loan';

describe('calculateLoan', () => {
  it('matches the standard EMI formula for ₹5,00,000 at 11% over 36 months', () => {
    const result = calculateLoan(500_000, 11, 36);
    expect(result.emi).toBe(16_369);
    expect(result.totalPayment).toBe(16_369 * 36);
    expect(result.totalInterest).toBe(16_369 * 36 - 500_000);
    expect(result.principalPct + result.interestPct).toBe(100);
  });

  it('handles a zero interest rate', () => {
    expect(calculateLoan(120_000, 0, 12)).toMatchObject({ emi: 10_000, totalInterest: 0, interestPct: 0 });
  });
});

describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    expect(formatINR(1_500_000)).toBe('₹15,00,000');
  });
});
