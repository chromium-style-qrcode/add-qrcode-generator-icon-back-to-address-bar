import { useEffect, useState } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  clearHistory,
  loadHistory,
  type HistoryItem
} from '@/src/lib/history'

interface HistoryViewProps {
  onSelect: (text: string) => void
}

function HistoryView({ onSelect }: HistoryViewProps) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [query, setQuery] = useState('')

  const refresh = () => {
    loadHistory().then(setItems)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleClear = async () => {
    await clearHistory()
    setItems([])
  }

  const filtered = query.trim()
    ? items.filter((item) =>
        item.text.toLowerCase().includes(query.trim().toLowerCase())
      )
    : items

  if (items.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center px-4 text-center text-sm text-[var(--chromium-secondary-text)]'>
        {i18n.t('history_empty')}
      </div>
    )
  }

  return (
    <div className='flex flex-1 flex-col gap-2 px-4 py-3'>
      <div className='flex items-center gap-2'>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={i18n.t('history_search_placeholder')}
          aria-label={i18n.t('history_search')}
          className='chromium-input text-sm transition-all focus:outline-none'
        />
        <Button
          variant='outline'
          className='cursor-pointer text-xs shrink-0'
          onClick={handleClear}
        >
          {i18n.t('history_clear')}
        </Button>
      </div>
      <span className='text-xs text-[var(--chromium-secondary-text)]'>
        {i18n.t('history_count', [filtered.length])}
      </span>
      <ul className='flex flex-1 flex-col gap-1 overflow-y-auto'>
        {filtered.length === 0 ? (
          <li className='px-2 py-3 text-center text-xs text-[var(--chromium-secondary-text)]'>
            {i18n.t('history_no_results')}
          </li>
        ) : (
          filtered.map((item) => (
            <li key={`${item.ts}-${item.text}`}>
              <button
                type='button'
                className='w-full truncate rounded border border-transparent px-2 py-1.5 text-left text-sm text-[var(--chromium-text)] hover:border-[var(--chromium-border)] hover:bg-[var(--chromium-hover)]'
                title={item.text}
                onClick={() => onSelect(item.text)}
              >
                {item.text}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default HistoryView
