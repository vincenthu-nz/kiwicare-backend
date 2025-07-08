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
 * @param cents Amount in cents (integer).
 * @returns Amount in NZD (number with two decimal places).
 */
export function centsToNzd(cents: number): number {
  if (!Number.isFinite(cents)) {
    throw new Error('Invalid cents amount');
  }
  return +(cents / 100).toFixed(2);
}
