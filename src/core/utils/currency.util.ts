/**
 * Convert NZD to cents.
 * @param nzd Amount in NZD (number or string).
 * @returns Amount in cents (integer).
 */
export function nzdToCents(nzd: number | string): number {
  if (typeof nzd === 'string') {
    nzd = parseFloat(nzd);
  }
  if (isNaN(nzd)) {
    throw new Error('Invalid NZD amount');
  }
  return Math.round(nzd * 100);
}

/**
 * Convert cents to NZD.
 * @param cents Amount in cents (integer or string).
 * @returns Amount in NZD (number with two decimal places).
 */
export function centsToNzd(cents: number | string): number {
  const n = typeof cents === 'string' ? Number(cents) : cents;

  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error('Invalid cents amount (must be integer)');
  }

  return n / 100;
}
