import type { Plan } from './types'

/**
 * The set of capabilities unlocked by the Pro license. Core QR generation
 * (current page / text, copy, PNG download, logo, dark mode, context menu,
 * omnibox, basic history, basic decode) stays free.
 */
export const PRO_FEATURES = [
  'svgExport',
  'highResExport',
  'batchExport',
  'eccLevels',
  'themes',
  'vcardEvents',
  'unlimitedHistory'
] as const

export type ProFeature = (typeof PRO_FEATURES)[number]

export const isPro = (plan: Plan): boolean => plan === 'pro'

export const hasFeature = (plan: Plan, _feature: ProFeature): boolean =>
  isPro(plan)

export const PRICING_URL =
  (import.meta.env?.VITE_PRICING_URL as string | undefined) ??
  'https://example.com/pricing.html'
