import type { LicenseStatus, Plan } from './types'

/**
 * License API base. Configure via VITE_LICENSE_API (a `.env` var) to point at
 * the Cloudflare Worker that validates license keys issued by our Merchant of
 * Record (Waffo Pancake). Defaults to a placeholder until you wire a domain.
 */
const LICENSE_API =
  (import.meta.env?.VITE_LICENSE_API as string | undefined) ??
  'https://license.example.com'

const LICENSE_STORAGE_KEY = 'license'
const INSTANCE_ID_KEY = 'instanceId'

const EMPTY_STATUS: LicenseStatus = {
  plan: 'free',
  key: null,
  activatedAt: null,
  validatedAt: null,
  error: null
}

/** A stable per-device identifier used to bind a license activation. */
export async function getInstanceId(): Promise<string> {
  const { [INSTANCE_ID_KEY]: existing } = await browser.storage.local.get(
    INSTANCE_ID_KEY
  )
  if (typeof existing === 'string' && existing) return existing
  const id = crypto.randomUUID()
  await browser.storage.local.set({ [INSTANCE_ID_KEY]: id })
  return id
}

export async function loadLicenseStatus(): Promise<LicenseStatus> {
  const { [LICENSE_STORAGE_KEY]: stored } = await browser.storage.sync.get(
    LICENSE_STORAGE_KEY
  )
  if (!stored || typeof stored !== 'object') return { ...EMPTY_STATUS }
  return { ...EMPTY_STATUS, ...(stored as Partial<LicenseStatus>) }
}

export async function loadPlan(): Promise<Plan> {
  return (await loadLicenseStatus()).plan
}

async function callApi(
  path: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await fetch(`${LICENSE_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : `HTTP ${res.status}`
    )
  }
  return data
}

export async function activateLicense(key: string): Promise<LicenseStatus> {
  const normalized = key.trim()
  if (!normalized) {
    return { ...EMPTY_STATUS, error: 'empty' }
  }
  try {
    const instanceId = await getInstanceId()
    await callApi('/api/license/activate', { key: normalized, instanceId })
    const status: LicenseStatus = {
      plan: 'pro',
      key: normalized,
      activatedAt: Date.now(),
      validatedAt: Date.now(),
      error: null
    }
    await browser.storage.sync.set({ [LICENSE_STORAGE_KEY]: status })
    return status
  } catch (error) {
    return {
      ...EMPTY_STATUS,
      error: error instanceof Error ? error.message : 'unknown'
    }
  }
}

export async function deactivateLicense(): Promise<void> {
  const current = await loadLicenseStatus()
  if (current.key) {
    const instanceId = await getInstanceId()
    await callApi('/api/license/deactivate', {
      key: current.key,
      instanceId
    }).catch(() => {})
  }
  await browser.storage.sync.remove(LICENSE_STORAGE_KEY)
}

/**
 * Re-validate an active license against the server. On any failure the locally
 * cached status is preserved (offline grace) — a temporary network error must
 * not revoke Pro.
 */
export async function validateLicense(): Promise<LicenseStatus> {
  const current = await loadLicenseStatus()
  if (!current.key) return current
  try {
    const instanceId = await getInstanceId()
    await callApi('/api/license/validate', { key: current.key, instanceId })
    const updated: LicenseStatus = {
      ...current,
      plan: 'pro',
      validatedAt: Date.now(),
      error: null
    }
    await browser.storage.sync.set({ [LICENSE_STORAGE_KEY]: updated })
    return updated
  } catch {
    return current
  }
}
