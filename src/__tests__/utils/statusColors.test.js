import { describe, it, expect } from 'vitest'
import {
  vehicleStatusColors, tripStatusColors, healthGradeColors,
  healthGradeBarColors, getStatusColor,
} from '../../utils/statusColors'

describe('vehicleStatusColors', () => {
  it('contains entries for all known vehicle statuses', () => {
    expect(vehicleStatusColors.AVAILABLE).toBeTruthy()
    expect(vehicleStatusColors.IN_USE).toBeTruthy()
    expect(vehicleStatusColors.MAINTENANCE).toBeTruthy()
    expect(vehicleStatusColors.DECOMMISSIONED).toBeTruthy()
  })

  it('returns green classes for AVAILABLE', () => {
    expect(vehicleStatusColors.AVAILABLE).toContain('green')
  })
})

describe('tripStatusColors', () => {
  it('APPROVED is green', () => {
    expect(tripStatusColors.APPROVED).toContain('green')
  })

  it('REJECTED is red', () => {
    expect(tripStatusColors.REJECTED).toContain('red')
  })

  it('PENDING is amber', () => {
    expect(tripStatusColors.PENDING).toContain('amber')
  })
})

describe('healthGradeColors', () => {
  it('covers all five health grades', () => {
    ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].forEach((grade) => {
      expect(healthGradeColors[grade]).toBeTruthy()
    })
  })
})

describe('healthGradeBarColors', () => {
  it('maps each grade to a solid bg colour class', () => {
    Object.values(healthGradeBarColors).forEach((cls) => {
      expect(cls).toMatch(/^bg-/)
    })
  })
})

describe('getStatusColor', () => {
  it('returns the correct class for a known status/type pair', () => {
    expect(getStatusColor('AVAILABLE', 'vehicle')).toBe(vehicleStatusColors.AVAILABLE)
    expect(getStatusColor('APPROVED', 'trip')).toBe(tripStatusColors.APPROVED)
    expect(getStatusColor('EXCELLENT', 'health')).toBe(healthGradeColors.EXCELLENT)
  })

  it('returns fallback class for unknown status', () => {
    expect(getStatusColor('UNKNOWN', 'vehicle')).toBe('bg-stone-100 text-stone-600')
  })

  it('defaults to maintenance type when type is omitted', () => {
    const result = getStatusColor('OPEN')
    expect(result).toBeTruthy()
  })
})
