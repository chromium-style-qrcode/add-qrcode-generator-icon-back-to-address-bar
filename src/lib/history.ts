const HISTORY_KEY = 'history'
const HISTORY_LIMIT = 50

export interface HistoryItem {
  text: string
  ts: number
}

export const loadHistory = async (): Promise<HistoryItem[]> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return []
  const result = await chrome.storage.local.get(HISTORY_KEY)
  const items = result[HISTORY_KEY] as HistoryItem[] | undefined
  return Array.isArray(items) ? items : []
}

export const addHistoryItem = async (text: string): Promise<void> => {
  if (!text.trim() || typeof chrome === 'undefined' || !chrome.storage?.local) {
    return
  }

  const current = await loadHistory()
  const next = [
    { text, ts: Date.now() },
    ...current.filter((item) => item.text !== text)
  ].slice(0, HISTORY_LIMIT)

  await chrome.storage.local.set({ [HISTORY_KEY]: next })
}

export const clearHistory = async (): Promise<void> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return
  await chrome.storage.local.remove(HISTORY_KEY)
}
