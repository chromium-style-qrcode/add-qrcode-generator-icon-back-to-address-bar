import { useState, useEffect } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'

interface OptionsConfig {
  showDino: boolean
}

const DEFAULT_CONFIG: OptionsConfig = {
  showDino: true
}

function Options() {
  const [saveStatus, setSaveStatus] = useState('')
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    chrome.storage!.sync.get(DEFAULT_CONFIG, (result: OptionsConfig) => {
      setConfig(result)
    })
  }, [])

  const handleSave = () => {
    chrome.storage!.sync.set(config, () => {
      setSaveStatus(i18n.t('options_saved'))
      setTimeout(() => setSaveStatus(''), 2000)
    })
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    chrome.storage!.sync.set(DEFAULT_CONFIG, () => {
      setSaveStatus(i18n.t('options_reset_done'))
      setTimeout(() => setSaveStatus(''), 2000)
    })
  }

  return (
    <div className='bg-background min-h-screen p-6'>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-8'>
          <h1 className='text-foreground mb-2 text-2xl font-bold'>
            {i18n.t('options_title')}
          </h1>
          <p className='text-muted-foreground'>
            {i18n.t('options_description')}
          </p>
        </div>
        <div className='bg-card space-y-6 rounded-lg border p-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <label className='text-foreground text-sm font-medium'>
                {i18n.t('options_show_dino')}
              </label>
              <p className='text-muted-foreground text-sm'>
                {i18n.t('options_show_dino_description')}
              </p>
            </div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='showDino'
                checked={config.showDino}
                aria-label={i18n.t('options_show_dino')}
                onChange={(e) =>
                  setConfig({ ...config, showDino: e.target.checked })
                }
                className='border-border text-primary focus:ring-primary h-4 w-4 rounded focus:ring-2'
              />
            </div>
          </div>

          <div className='border-t pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                {saveStatus && (
                  <span className='text-sm text-green-600 dark:text-green-400'>
                    {saveStatus}
                  </span>
                )}
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  className='text-sm'
                  onClick={handleReset}
                >
                  {i18n.t('options_reset')}
                </Button>
                <Button onClick={handleSave} className='text-sm'>
                  {i18n.t('options_save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            {i18n.t('options_footer')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Options
