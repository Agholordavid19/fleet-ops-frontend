import { describe, it, expect } from 'vitest'
import { cn } from '../../utils/cn'

describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
    expect(result).not.toContain('bg-red-500')
  })

  it('handles conditional objects', () => {
    expect(cn({ 'font-bold': true, italic: false })).toBe('font-bold')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('returns empty string when all inputs are falsy', () => {
    expect(cn(null, undefined, false)).toBe('')
  })
})
