import { useState } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'
import { exportBatchPng } from '@/src/lib/export'
import type { Plan } from '@/src/lib/types'

function BatchView({
  plan,
  onUpgrade
}: {
  plan: Plan
  onUpgrade: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const lines = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const handleExport = async () => {
    if (plan !== 'pro') {
      onUpgrade()
      return
    }
    if (lines.length === 0) return
    setBusy(true)
    setDone(false)
    try {
      await exportBatchPng(lines)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='flex flex-1 flex-col gap-2 px-4 py-3'>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={i18n.t('batch_placeholder')}
        aria-label={i18n.t('batch_placeholder')}
        rows={10}
        className='chromium-input w-full flex-1 resize-none text-sm transition-all focus:outline-none'
      />
      <div className='flex items-center justify-between'>
        <span className='text-xs text-[var(--chromium-secondary-text)]'>
          {i18n.t('batch_count', [lines.length])}
        </span>
        <Button
          disabled={busy || lines.length === 0}
          className='chromium-button min-h-8 rounded-2xl border px-4 py-2 text-center leading-5 disabled:cursor-not-allowed'
          onClick={() => void handleExport()}
        >
          {done
            ? i18n.t('batch_done')
            : plan === 'pro'
              ? i18n.t('batch_generate')
              : i18n.t('batch_pro')}
        </Button>
      </div>
    </div>
  )
}

export default BatchView
