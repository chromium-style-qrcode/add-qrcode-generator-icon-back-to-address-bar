import { useState, useEffect } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'

import { compressImage } from '@/src/lib/utils'
import { DEFAULT_CONFIG } from '@/src/constant/default'

function Options() {
  const [saveStatus, setSaveStatus] = useState('')
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    chrome.storage!.sync.get(DEFAULT_CONFIG, setConfig)
  }, [])

  const handleCleanUp = () => {
    setTimeout(() => setSaveStatus(''), 2000)
  }

  const handleSave = () => {
    chrome.storage!.sync.set(config, () => {
      setSaveStatus(i18n.t('options_saved'))
      handleCleanUp()
    })
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    chrome.storage!.sync.set(DEFAULT_CONFIG, () => {
      setSaveStatus(i18n.t('options_reset_done'))
      handleCleanUp()
    })
  }

  const handleCustomLogo = async (files: FileList | null) => {
    const file = files && files[0]
    if (!file) return

    try {
      const compressedDataUrl = await compressImage(file)
      setConfig({ ...config, customLogo: compressedDataUrl })
    } catch (error) {
      console.error('Failed to compress image:', error)
      setSaveStatus(i18n.t('options_custom_logo_error'))
      handleCleanUp()
    }
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
                id='showDino'
                type='checkbox'
                checked={config.showDino}
                aria-label={i18n.t('options_show_dino')}
                onChange={({ target: { checked } }) =>
                  setConfig({ ...config, showDino: checked })
                }
                className='border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded focus:ring-2'
              />
            </div>
          </div>
          <div className='pt-4'>
            <label className='text-foreground mb-[3px] block text-sm font-medium'>
              {i18n.t('options_custom_logo')}
            </label>
            <div className='flex items-center gap-4'>
              {!config.customLogo && (
                <label
                  htmlFor='logo'
                  className='border-border h-10 w-10 cursor-pointer rounded border border-dashed text-sm'
                >
                  <input
                    id='logo'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={({ target: { files } }) =>
                      handleCustomLogo(files)
                    }
                  />
                </label>
              )}
              {config.customLogo && (
                <div className='flex items-center gap-2'>
                  <img
                    alt='logo-preview'
                    src={config.customLogo}
                    className='h-10 w-10 rounded object-cover object-center'
                  />
                  <button
                    className='text-muted-foreground hover:text-foreground cursor-pointer text-sm'
                    onClick={() => setConfig({ ...config, customLogo: null })}
                  >
                    {i18n.t('options_custom_logo_remove')}
                  </button>
                </div>
              )}
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
                  className='cursor-pointer text-sm'
                  onClick={handleReset}
                >
                  {i18n.t('options_reset')}
                </Button>
                <Button onClick={handleSave} className='cursor-pointer text-sm'>
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
