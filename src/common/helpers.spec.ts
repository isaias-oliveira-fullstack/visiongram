import { describe, expect, it } from 'vitest'
import { normalizeGenderValue } from './helpers'

describe('normalizeGenderValue', () => {
  it('keeps canonical values intact', () => {
    expect(normalizeGenderValue('Female')).toBe('Female')
    expect(normalizeGenderValue('Male')).toBe('Male')
    expect(normalizeGenderValue('Other')).toBe('Other')
  })

  it('maps localized and shorthand values to the canonical options', () => {
    expect(normalizeGenderValue('Feminino')).toBe('Female')
    expect(normalizeGenderValue('Masculino')).toBe('Male')
    expect(normalizeGenderValue('f')).toBe('Female')
    expect(normalizeGenderValue('m')).toBe('Male')
  })

  it('falls back to Other for empty or unsupported values', () => {
    expect(normalizeGenderValue('')).toBe('Other')
    expect(normalizeGenderValue(null)).toBe('Other')
    expect(normalizeGenderValue(undefined)).toBe('Other')
  })
})
