// Reference rates carried over from the previous /servicios page (1 USD = 4200 COP = 0.92 EUR).
// They are NOT a live exchange feed — the UI labels them as approximate until a source is wired in.
export type Currency = 'USD' | 'COP' | 'EUR'

export const CURRENCIES: Currency[] = ['USD', 'COP', 'EUR']

const RATES: Record<Currency, number> = { USD: 1, COP: 4200, EUR: 0.92 }

export function formatPrice(usd: number, currency: Currency, locale: 'es' | 'en'): string {
  const v = usd * RATES[currency]
  if (currency === 'COP') return `$${Math.round(v).toLocaleString(locale === 'es' ? 'es-CO' : 'en-US')} COP`
  if (currency === 'EUR') return `€${Math.round(v).toLocaleString(locale === 'es' ? 'es-ES' : 'en-GB')}`
  return `US$${v.toLocaleString(locale === 'es' ? 'es-CO' : 'en-US')}`
}

export const CURRENCY_KEY = 'deepsun-currency'
