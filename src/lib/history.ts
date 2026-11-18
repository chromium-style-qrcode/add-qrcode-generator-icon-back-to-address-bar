import type { Plan } from './types'

const HISTORY_KEY = 'history'

/** Free tier keeps the last 50 items; Pro keeps up to 500. */
const FREE_LIMIT = 50
const PRO_LIMIT = 500

export interface HistoryItem {
  text: string
  ts: number
}

export const getHistoryLimit = (plan: Plan): number =>
  plan === 'pro' ? PRO_LIMIT : FREE_LIMIT

export const loadHistory = async (): Promise<HistoryItem[]> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return []
  const result = await chrome.storage.local.get(HISTORY_KEY)
  const items = result[HISTORY_KEY] as HistoryItem[] | undefined
  return Array.isArray(items) ? items : []
}

export const addHistoryItem = async (
  text: string,
  plan: Plan = 'free'
): Promise<void> => {
  if (!text.trim() || typeof chrome === 'undefined' || !chrome.storage?.local) {
    return
  }

  const current = await loadHistory()
  const next = [
    { text, ts: Date.now() },
    ...current.filter((item) => item.text !== text)
  ].slice(0, getHistoryLimit(plan))

  await chrome.storage.local.set({ [HISTORY_KEY]: next })
}

export const clearHistory = async (): Promise<void> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return
  await chrome.storage.local.remove(HISTORY_KEY)
}
