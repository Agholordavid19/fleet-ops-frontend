import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatDate, formatDateTime, formatRelativeTime,
  formatCurrency, formatMileage, formatPercentage, formatNumber,
} from '../../utils/formatters'

describe('formatDate', () => {
  it('returns em-dash for null/undefined', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formats an ISO date string as DD Mon YYYY', () => {
    const result = formatDate('2026-05-18')
    expect(result).toMatch(/18/)
    expect(result).toMatch(/2026/)
  })
})

describe('formatDateTime', () => {
  it('returns em-dash for falsy input', () => {
    expect(formatDateTime(null)).toBe('—')
  })

  it('includes date and time parts', () => {
    const result = formatDateTime('2026-05-18T14:30:00Z')
    expect(result).toMatch(/2026/)
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-18T12:00:00Z'))
  })

  afterEach(() => vi.useRealTimers())

  it('returns em-dash for falsy input', () => {
    expect(formatRelativeTime(null)).toBe('—')
  })

  it('returns "just now" for events less than 60s ago', () => {
    expect(formatRelativeTime('2026-05-18T11:59:30Z')).toBe('just now')
  })

  it('returns minutes for events less than 1h ago', () => {
    expect(formatRelativeTime('2026-05-18T11:45:00Z')).toBe('15m ago')
  })

  it('returns hours for events less than 24h ago', () => {
    expect(formatRelativeTime('2026-05-18T09:00:00Z')).toBe('3h ago')
  })

  it('returns days for events less than 7 days ago', () => {
    expect(formatRelativeTime('2026-05-16T12:00:00Z')).toBe('2d ago')
  })

  it('returns formatted date for events older than 7 days', () => {
    const result = formatRelativeTime('2026-05-01T00:00:00Z')
    expect(result).toMatch(/2026/)
  })
})

describe('formatCurrency', () => {
  it('returns em-dash for null', () => {
    expect(formatCurrency(null)).toBe('—')
  })

  it('formats NGN amounts by default', () => {
    expect(formatCurrency(25000)).toBe('₦25,000')
  })

  it('accepts a custom currency', () => {
    const result = formatCurrency(1000, 'EUR')
    expect(result).toContain('1,000')
  })
})

describe('formatMileage', () => {
  it('returns em-dash for null', () => {
    expect(formatMileage(null)).toBe('—')
  })

  it('appends km suffix', () => {
    expect(formatMileage(45000)).toBe('45,000 km')
  })

  it('formats zero', () => {
    expect(formatMileage(0)).toBe('0 km')
  })
})

describe('formatPercentage', () => {
  it('returns em-dash for null', () => {
    expect(formatPercentage(null)).toBe('—')
  })

  it('formats with one decimal by default', () => {
    expect(formatPercentage(75.5)).toBe('75.5%')
  })

  it('respects custom decimal places', () => {
    expect(formatPercentage(75, 0)).toBe('75%')
  })
})

describe('formatNumber', () => {
  it('returns em-dash for null', () => {
    expect(formatNumber(null)).toBe('—')
  })

  it('formats large numbers with commas', () => {
    expect(formatNumber(1000000)).toBe('1,000,000')
  })
})
