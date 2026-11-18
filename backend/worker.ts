/**
 * QR Pro license server — Cloudflare Worker.
 *
 * Talks to our Merchant of Record (Waffo Pancake) via signed webhooks and
 * issues license keys for the "QR Pro" one-time purchase.
 *
 * Endpoints:
 *   POST /webhook/waffo                     Waffo `order.completed` webhook
 *   GET  /api/license/lookup?email=...       Look up issued keys by buyer email
 *   POST /api/license/activate               { key, instanceId }
 *   POST /api/license/validate               { key, instanceId }
 *   POST /api/license/deactivate             { key, instanceId }
 *
 * Storage: Cloudflare KV binding `LICENSE_KV`.
 *
 * TODO before deploy: set WAFFO_WEBHOOK_PUBLIC_KEY to the RSA public key from
 * your Waffo account, and point `custom_domain` in wrangler.jsonc at your
 * real license subdomain.
 */

export interface Env {
  LICENSE_KV: KVNamespace
  WAFFO_WEBHOOK_PUBLIC_KEY?: string
}

// Key alphabet without easily-confused glyphs (0/O, 1/I/L).
const KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const MAX_INSTANCES = 3

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  })
}

function generateLicenseKey(): string {
  const group = (): string => {
    const bytes = crypto.getRandomValues(new Uint8Array(4))
    return Array.from(bytes)
      .map((b) => KEY_ALPHABET[b % KEY_ALPHABET.length])
      .join('')
  }
  return `QR-${group()}-${group()}-${group()}-${group()}`
}

interface LicenseRecord {
  key: string
  email: string
  orderId: string
  status: 'issued' | 'active' | 'revoked'
  issuedAt: number
  activatedAt: number | null
  instances: string[]
  maxInstances: number
}

async function readLicense(
  env: Env,
  key: string
): Promise<LicenseRecord | null> {
  const raw = await env.LICENSE_KV.get(`license:${key}`)
  if (!raw) return null
  return JSON.parse(raw) as LicenseRecord
}

async function writeLicense(env: Env, rec: LicenseRecord): Promise<void> {
  await env.LICENSE_KV.put(`license:${rec.key}`, JSON.stringify(rec))
}

async function indexEmail(env: Env, email: string, key: string): Promise<void> {
  const existing = await env.LICENSE_KV.get(`email:${email}`)
  const keys: string[] = existing ? JSON.parse(existing) : []
  if (!keys.includes(key)) {
    keys.push(key)
    await env.LICENSE_KV.put(`email:${email}`, JSON.stringify(keys))
  }
}

async function pemToKey(pem: string): Promise<CryptoKey | null> {
  try {
    const binary = atob(
      pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s+/g, '')
    )
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return await crypto.subtle.importKey(
      'spki',
      bytes,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )
  } catch {
    return null
  }
}

async function verifyWaffoSignature(
  request: Request,
  rawBody: string,
  env: Env
): Promise<boolean> {
  const header = request.headers.get('X-Waffo-Signature')
  if (!header || !env.WAFFO_WEBHOOK_PUBLIC_KEY) return false

  let t = ''
  let v1 = ''
  for (const part of header.split(',')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const k = part.slice(0, eq).trim()
    const v = part.slice(eq + 1).trim()
    if (k === 't') t = v
    else if (k === 'v1') v1 = v
  }
  if (!t || !v1) return false

  // Reject stale timestamps (replay protection).
  const ageMs = Date.now() - Number(t)
  if (Number.isNaN(ageMs) || ageMs > 45 * 60 * 1000 || ageMs < -60 * 1000) {
    return false
  }

  const key = await pemToKey(env.WAFFO_WEBHOOK_PUBLIC_KEY)
  if (!key) return false

  const signedInput = `${t}.${rawBody}`
  const signatureBytes = Uint8Array.from(atob(v1), (c) => c.charCodeAt(0))
  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signatureBytes,
    new TextEncoder().encode(signedInput)
  )
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    // ------------------------------------------------------------------ webhook
    if (url.pathname === '/webhook/waffo' && request.method === 'POST') {
      const rawBody = await request.text()
      if (!(await verifyWaffoSignature(request, rawBody, env))) {
        return json({ error: 'invalid signature' }, 401)
      }
      const event = JSON.parse(rawBody) as {
        eventType?: string
        data?: { orderId?: string; buyerEmail?: string }
      }
      if (event.eventType !== 'order.completed') {
        return json({ ok: true, ignored: event.eventType })
      }
      const email = normalizeEmail(event.data?.buyerEmail ?? '')
      const orderId = event.data?.orderId ?? ''
      if (!email || !orderId) {
        return json({ error: 'missing buyerEmail or orderId' }, 400)
      }

      const orderIdx = await env.LICENSE_KV.get(`order:${orderId}`)
      if (orderIdx) {
        const { key } = JSON.parse(orderIdx) as { key: string }
        return json({ ok: true, key, alreadyIssued: true })
      }

      const key = generateLicenseKey()
      const record: LicenseRecord = {
        key,
        email,
        orderId,
        status: 'issued',
        issuedAt: Date.now(),
        activatedAt: null,
        instances: [],
        maxInstances: MAX_INSTANCES
      }
      await writeLicense(env, record)
      await env.LICENSE_KV.put(`order:${orderId}`, JSON.stringify({ key }))
      await indexEmail(env, email, key)
      return json({ ok: true, key })
    }

    // ------------------------------------------------------------------ lookup
    if (url.pathname === '/api/license/lookup' && request.method === 'GET') {
      const email = normalizeEmail(url.searchParams.get('email') ?? '')
      if (!email) return json({ error: 'email is required' }, 400)
      const raw = await env.LICENSE_KV.get(`email:${email}`)
      const keys: string[] = raw ? JSON.parse(raw) : []
      const records: Array<{
        key: string
        status: string
        issuedAt: number
        activatedAt: number | null
      }> = []
      for (const k of keys) {
        const rec = await readLicense(env, k)
        if (rec) {
          records.push({
            key: rec.key,
            status: rec.status,
            issuedAt: rec.issuedAt,
            activatedAt: rec.activatedAt
          })
        }
      }
      return json({ licenses: records })
    }

    // ---------------------------------------------------------------- activate
    if (url.pathname === '/api/license/activate' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as {
        key?: string
        instanceId?: string
      }
      const key = (body.key ?? '').trim()
      const instanceId = (body.instanceId ?? '').trim()
      if (!key || !instanceId) {
        return json({ error: 'key and instanceId are required' }, 400)
      }
      const rec = await readLicense(env, key)
      if (!rec) return json({ error: 'invalid license key' }, 403)
      if (rec.status === 'revoked') {
        return json({ error: 'license revoked' }, 403)
      }
      if (!rec.instances.includes(instanceId)) {
        if (rec.instances.length >= rec.maxInstances) {
          return json(
            { error: 'license already used on the maximum number of devices' },
            403
          )
        }
        rec.instances.push(instanceId)
      }
      rec.status = 'active'
      rec.activatedAt = rec.activatedAt ?? Date.now()
      await writeLicense(env, rec)
      return json({ valid: true, plan: 'pro' })
    }

    // ---------------------------------------------------------------- validate
    if (url.pathname === '/api/license/validate' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as {
        key?: string
        instanceId?: string
      }
      const key = (body.key ?? '').trim()
      const instanceId = (body.instanceId ?? '').trim()
      if (!key || !instanceId) {
        return json({ error: 'key and instanceId are required' }, 400)
      }
      const rec = await readLicense(env, key)
      if (!rec) return json({ error: 'invalid license key' }, 403)
      if (rec.status === 'revoked') {
        return json({ error: 'license revoked' }, 403)
      }
      if (!rec.instances.includes(instanceId)) {
        return json({ error: 'license not active on this device' }, 403)
      }
      return json({ valid: true, plan: 'pro' })
    }

    // -------------------------------------------------------------- deactivate
    if (url.pathname === '/api/license/deactivate' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as {
        key?: string
        instanceId?: string
      }
      const key = (body.key ?? '').trim()
      const instanceId = (body.instanceId ?? '').trim()
      if (!key || !instanceId) {
        return json({ error: 'key and instanceId are required' }, 400)
      }
      const rec = await readLicense(env, key)
      if (!rec) return json({ ok: true })
      rec.instances = rec.instances.filter((i) => i !== instanceId)
      await writeLicense(env, rec)
      return json({ ok: true })
    }

    return json({ error: 'not found' }, 404)
  }
}
