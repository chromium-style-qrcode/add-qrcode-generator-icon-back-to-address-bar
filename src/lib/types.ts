export type Plan = 'free' | 'pro'

export interface LicenseStatus {
  plan: Plan
  key: string | null
  activatedAt: number | null
  validatedAt: number | null
  error: string | null
}
