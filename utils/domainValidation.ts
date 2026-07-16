import { z } from 'zod'

/** RFC 1035 single-label limit for the domain name without TLD. */
export const DOMAIN_LABEL_MAX = 63
export const DOMAIN_LABEL_MIN = 3
export const MAX_TLDS_PER_CHECK = 50

/** Domain label without TLD (e.g. "example", not "example.com"). */
export const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$/

/** Safe hostname for WHOIS links and display (no path/query/scheme). */
export const SAFE_DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/

export type TranslateFn = (key: string) => string

export function createDomainSearchSchema(t: TranslateFn) {
  return z.object({
    search: z
      .string()
      .min(DOMAIN_LABEL_MIN, t('schema.searchMin'))
      .max(DOMAIN_LABEL_MAX, t('schema.searchMax') || 'Domain name too long (max 63 characters)')
      .regex(DOMAIN_LABEL_REGEX, t('schema.searchRegex')),
  })
}

export function isValidDomainLabel(value: string): boolean {
  return (
    value.length >= DOMAIN_LABEL_MIN
    && value.length <= DOMAIN_LABEL_MAX
    && DOMAIN_LABEL_REGEX.test(value)
  )
}

export function isSafeDomainName(value: string): boolean {
  return value.length <= 253 && SAFE_DOMAIN_REGEX.test(value)
}

/**
 * Normalize TLD tokens (ensure leading dot) and keep only allowlisted values.
 * Drops unknown TLDs so query-string injection cannot invent arbitrary suffixes.
 */
export function filterAllowedTlds(
  tlds: readonly string[],
  allowedTlds: ReadonlySet<string>,
  max = MAX_TLDS_PER_CHECK,
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of tlds) {
    if (typeof raw !== 'string' || !raw.trim()) continue
    const normalized = raw.startsWith('.') ? raw : `.${raw}`
    if (!allowedTlds.has(normalized) || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
    if (result.length >= max) break
  }

  return result
}

/** Build allowlist from static TLD data names (with or without leading dot). */
export function buildAllowedTldSet(tldNames: readonly string[]): Set<string> {
  return new Set(
    tldNames.map(name => (name.startsWith('.') ? name : `.${name}`)),
  )
}
