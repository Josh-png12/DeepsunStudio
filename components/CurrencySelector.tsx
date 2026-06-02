'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type Currency = 'USD' | 'COP' | 'EUR'

const CURRENCIES: { code: Currency; label: string; flag: string }[] = [
  { code: 'USD', label: 'USD', flag: '🇺🇸' },
  { code: 'COP', label: 'COP', flag: '🇨🇴' },
  { code: 'EUR', label: 'EUR', flag: '🇪🇺' },
]

const RATES: Record<Currency, number> = {
  USD: 1,
  COP: 4200,
  EUR: 0.92,
}

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  COP: '$',
  EUR: '€',
}

export function formatPrice(usdAmount: number, currency: Currency): string {
  const converted = usdAmount * RATES[currency]
  if (currency === 'COP') {
    return `${SYMBOLS[currency]}${converted.toLocaleString('es-CO')}`
  }
  if (currency === 'EUR') {
    return `€${converted.toLocaleString('es-ES', { minimumFractionDigits: 0 })}`
  }
  return `$${converted.toLocaleString('en-US')}`
}

const LS_KEY = 'deepsun-currency'

interface CurrencySelectorProps {
  value: Currency
  onChange: (c: Currency) => void
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl glass-card border border-white/[0.1]"
      role="group"
      aria-label="Seleccionar moneda"
    >
      {CURRENCIES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[72px] justify-center ${
            value === code
              ? 'text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-pressed={value === code}
        >
          {value === code && (
            <motion.span
              layoutId="currency-pill"
              className="absolute inset-0 bg-blue-600 rounded-lg"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 text-base leading-none">{flag}</span>
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  )
}

export function useCurrency(): [Currency, (c: Currency) => void] {
  const [currency, setCurrencyState] = useState<Currency>('USD')

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) as Currency | null
    if (saved && RATES[saved]) setCurrencyState(saved)
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem(LS_KEY, c)
  }

  return [currency, setCurrency]
}

interface AnimatedPriceProps {
  usd: number | null
  currency: Currency
  prefix?: string
}

export function AnimatedPrice({ usd, currency, prefix }: AnimatedPriceProps) {
  const text = usd === null ? 'Cotización' : formatPrice(usd, currency)
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${text}-${currency}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="inline-block"
      >
        {prefix && <span>{prefix} </span>}
        {text}
      </motion.span>
    </AnimatePresence>
  )
}
