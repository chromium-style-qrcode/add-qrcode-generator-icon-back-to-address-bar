import { useState } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'
import { PRICING_URL } from '@/src/lib/pro'
import {
  activateLicense,
  deactivateLicense
} from '@/src/lib/license'
import type { Plan } from '@/src/lib/types'

function LicenseSection({
  plan,
  onPlanChange
}: {
  plan: Plan
  onPlanChange: (plan: Plan) => void
}) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const handleActivate = async () => {
    setBusy(true)
    setMessage('')
    const status = await activateLicense(key)
    setBusy(false)
    if (status.plan === 'pro') {
      onPlanChange('pro')
      setMessage(i18n.t('license_activated'))
    } else {
      setMessage(i18n.t('license_activate_failed'))
    }
  }

  const handleDeactivate = async () => {
    setBusy(true)
    setMessage('')
    await deactivateLicense()
    setBusy(false)
    setKey('')
    onPlanChange('free')
    setMessage(i18n.t('license_deactivated'))
  }

  if (plan === 'pro') {
    return (
      <div className='rounded-md border border-green-200 bg-green-50 p-4'>
        <p className='text-sm font-medium text-green-700'>
          {i18n.t('license_pro_active')}
        </p>
        <p className='text-muted-foreground mt-1 text-xs'>
          {i18n.t('license_thank_you')}
        </p>
        <div className='mt-3 flex items-center gap-3'>
          <Button
            variant='outline'
            className='cursor-pointer text-xs'
            disabled={busy}
            onClick={() => void handleDeactivate()}
          >
            {i18n.t('license_deactivate')}
          </Button>
          {message && <span className='text-xs'>{message}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-md border border-dashed p-4'>
      <p className='text-sm font-medium'>{i18n.t('license_label')}</p>
      <div className='mt-2 flex items-center gap-2'>
        <input
          type='text'
          value={key}
          placeholder='QR-XXXX-XXXX-XXXX-XXXX'
          className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-2'
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleActivate()
          }}
        />
        <Button
          className='cursor-pointer text-sm'
          disabled={busy || !key.trim()}
          onClick={() => void handleActivate()}
        >
          {i18n.t('license_activate')}
        </Button>
      </div>
      {message && (
        <p className='mt-2 text-xs text-muted-foreground'>{message}</p>
      )}
      <p className='mt-2 text-xs text-muted-foreground'>
        <a
          className='text-blue-600 underline-offset-2 hover:underline'
          href={PRICING_URL}
          target='_blank'
          rel='noopener'
        >
          {i18n.t('options_pro_title')}
        </a>
      </p>
    </div>
  )
}

export default LicenseSection
