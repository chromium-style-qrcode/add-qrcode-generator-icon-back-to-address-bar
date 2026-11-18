import { useRef, useState } from 'react'
import { i18n } from '#i18n'

import { Button } from '@/src/components/ui/button'
import { decodeQRFromImage } from '@/src/lib/qr-decode'

interface ScanViewProps {
  onUseResult: (text: string) => void
}

function ScanView({ onUseResult }: ScanViewProps) {
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [decoding, setDecoding] = useState(false)
  const [scanningPage, setScanningPage] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const busy = decoding || scanningPage

  const resetOutput = () => {
    setResult('')
    setError('')
    setCopyFeedback('')
  }

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    setDecoding(true)
    resetOutput()
    try {
      const text = await decodeQRFromImage(file)
      setResult(text)
    } catch {
      setError(i18n.t('scan_decode_error'))
    } finally {
      setDecoding(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleScanPage = () => {
    setScanningPage(true)
    resetOutput()

    const tabIdPromise = new Promise<number | undefined>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
        resolve(tabs[0]?.id)
      )
    })

    const send = (
      tabId: number
    ): Promise<{ ok: boolean; text: string | null }> =>
      new Promise((resolve) => {
        let settled = false
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true
            resolve({ ok: false, text: null })
          }
        }, 3000)

        chrome.tabs.sendMessage(
          tabId,
          { type: 'SCAN_PAGE_FOR_QR' },
          (response) => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            const data = response as { ok?: boolean; text?: string | null }
            resolve({ ok: Boolean(data?.ok), text: data?.text ?? null })
          }
        )
      })

    ;(async () => {
      try {
        const tabId = await tabIdPromise
        if (tabId == null) {
          setError(i18n.t('scan_page_no_access'))
          return
        }
        const response = await send(tabId)
        if (response.ok && response.text) {
          setResult(response.text)
        } else if (response.ok) {
          setError(i18n.t('scan_page_not_found'))
        } else {
          setError(i18n.t('scan_page_no_access'))
        }
      } catch {
        setError(i18n.t('scan_page_no_access'))
      } finally {
        setScanningPage(false)
      }
    })()
  }

  const handleCopyText = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopyFeedback(i18n.t('copied'))
      setTimeout(() => setCopyFeedback(''), 1500)
    } catch (err) {
      console.error('Failed to copy decoded text:', err)
    }
  }

  return (
    <div className='flex flex-1 flex-col gap-3 px-4 py-3'>
      <div className='flex items-center gap-2'>
        <Button
          className='chromium-button min-h-8 rounded-2xl border px-4 py-2 text-center leading-5'
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {decoding ? i18n.t('scan_decoding') : i18n.t('scan_choose_image')}
        </Button>
        <Button
          className='chromium-button min-h-8 rounded-2xl border px-4 py-2 text-center leading-5'
          onClick={handleScanPage}
          disabled={busy}
        >
          {scanningPage ? i18n.t('scan_scanning') : i18n.t('scan_from_page')}
        </Button>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={({ target: { files } }) => handleFile(files)}
        />
      </div>

      {busy && (
        <div className='flex items-center justify-center py-4'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-[#1a73e8]'></div>
        </div>
      )}

      {error && (
        <p className='text-sm leading-4 text-[var(--chromium-error)]'>{error}</p>
      )}

      {result && (
        <div className='flex flex-col gap-2'>
          <div className='max-h-32 overflow-auto break-all rounded border border-[var(--chromium-border)] bg-[var(--chromium-hover)] p-2 text-sm'>
            {result}
          </div>
          <div className='flex gap-2'>
            <Button
              className='chromium-button min-h-8 rounded-2xl border px-4 py-2 text-center leading-5'
              onClick={handleCopyText}
            >
              {copyFeedback || i18n.t('scan_copy_text')}
            </Button>
            <Button
              className='chromium-button min-h-8 rounded-2xl border px-4 py-2 text-center leading-5'
              onClick={() => onUseResult(result)}
            >
              {i18n.t('scan_generate_qr')}
            </Button>
          </div>
        </div>
      )}

      <p className='mt-auto text-xs leading-4 text-[var(--chromium-secondary-text)]'>
        {i18n.t('scan_hint')}
      </p>
    </div>
  )
}

export default ScanView
