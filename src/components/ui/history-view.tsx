import { useEffect, useState } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'
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

  if (items.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center px-4 text-center text-sm text-[var(--chromium-secondary-text)]'>
        {i18n.t('history_empty')}
      </div>
    )
  }

  return (
    <div className='flex flex-1 flex-col gap-2 px-4 py-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-[var(--chromium-secondary-text)]'>
          {i18n.t('history_count', [items.length])}
        </span>
        <Button
          variant='outline'
          className='cursor-pointer text-xs'
          onClick={handleClear}
        >
          {i18n.t('history_clear')}
        </Button>
      </div>
      <ul className='flex flex-1 flex-col gap-1 overflow-y-auto'>
        {items.map((item) => (
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
        ))}
      </ul>
    </div>
  )
}

export default HistoryView
