import { useRef, useState, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { i18n } from '#i18n'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/src/components/ui/tooltip'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { QRCodeCanvas } from '@/src/components/ui/qrcode-canvas'
import ScanView from '@/src/components/ui/scan-view'
import HistoryView from '@/src/components/ui/history-view'
import BatchView from '@/src/components/ui/batch-view'
import { VCardForm, EventForm } from '@/src/components/ui/content-form'

import {
  ErrorType,
  useQRCode,
  getCenterLogoDataUrl
} from '@/src/hooks/use-qrcode'
import { addHistoryItem } from '@/src/lib/history'
import { loadPlan } from '@/src/lib/license'
import { PRICING_URL } from '@/src/lib/pro'
import { downloadSvg } from '@/src/lib/export'
import {
  buildVCard,
  buildVEvent,
  DEFAULT_VCARD,
  DEFAULT_EVENT,
  type VCardData,
  type EventData
} from '@/src/lib/content-types'
import { DEFAULT_CONFIG } from '@/src/constant/default'
import type { Plan } from '@/src/lib/types'

type Mode = 'text' | 'batch' | 'scan' | 'history'
type ContentType = 'text' | 'vcard' | 'event'

const TABS = [
  { id: 'text', labelKey: 'tab_link_text' },
  { id: 'batch', labelKey: 'tab_batch' },
  { id: 'scan', labelKey: 'tab_scan' },
  { id: 'history', labelKey: 'tab_history' }
] as const

function App() {
  const [qrState, qrActions] = useQRCode()
  const [mode, setMode] = useState<Mode>('text')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [inputValue, setInputValue] = useState('')
  const [vcardData, setVcardData] = useState<VCardData>(DEFAULT_VCARD)
  const [eventData, setEventData] = useState<EventData>(DEFAULT_EVENT)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [copyFeedback, setCopyFeedback] = useState('')
  const [urlUnavailable, setUrlUnavailable] = useState(false)
  const [plan, setPlan] = useState<Plan>('free')

  useEffect(() => {
    void loadPlan().then(setPlan)
  }, [])

  const textToEncode = useMemo(() => {
    if (contentType === 'vcard') return buildVCard(vcardData)
    if (contentType === 'event') return buildVEvent(eventData)
    return inputValue
  }, [contentType, inputValue, vcardData, eventData])

  // Resolve pre-filled input (context menu / omnibox) or fall back to the
  // current tab URL on mount.
  useEffect(() => {
    const init = async () => {
      let pending: string | undefined
      try {
        const { pendingInput } = await chrome.storage.session.get('pendingInput')
        pending = pendingInput as string | undefined
        if (pending) {
          await chrome.storage.session.remove('pendingInput')
        }
      } catch (error) {
        console.error('Failed to read pending input:', error)
      }

      if (pending) {
        setInputValue(pending)
        setContentType('text')
        setMode('text')
      } else if (typeof window !== 'undefined' && window.chrome?.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            setInputValue(tabs[0].url)
          } else if (tabs[0]) {
            setUrlUnavailable(true)
          }
        })
      }
    }

    init()

    setTimeout(() => {
      titleRef.current?.style.setProperty('visibility', 'visible')
    }, 50)
  }, [])

  // Generate QR code when the encoded text changes (debounced).
  useEffect(() => {
    if (mode !== 'text') return
    const timer = setTimeout(() => {
      qrActions.generateQRCode(textToEncode)
    }, 300)

    return () => clearTimeout(timer)
  }, [textToEncode, mode, qrActions.generateQRCode])

  // Save successfully generated QR codes to history (deduped, capped).
  useEffect(() => {
    if (mode !== 'text') return
    if (qrState.qrData && qrState.qrSize > 0 && textToEncode.trim()) {
      void addHistoryItem(textToEncode, plan)
    }
  }, [qrState.qrData, qrState.qrSize, textToEncode, mode, plan])

  const upgrade = () => {
    window.open(PRICING_URL, '_blank', 'noopener')
  }

  const handleCopy = async () => {
    if (qrState.qrData) {
      try {
        await qrActions.copyQRCode()
        setCopyFeedback(i18n.t('copied'))
        setTimeout(() => setCopyFeedback(''), 1500)
      } catch (error) {
        try {
          await navigator.clipboard.writeText(textToEncode)
          setCopyFeedback(i18n.t('copied'))
          setTimeout(() => setCopyFeedback(''), 1500)
        } catch (textError) {
          console.error('Failed to copy text:', textError)
        }
      }
    }
  }

  const handleDownload = () => {
    if (qrState.qrData) {
      let filename = 'qrcode_chrome.png'
      if (contentType === 'vcard') {
        filename = 'qrcode_contact.png'
      } else if (contentType === 'event') {
        filename = 'qrcode_event.png'
      } else {
        try {
          const url = new URL(inputValue)
          if (url.hostname && !/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)) {
            const safeHostname = url.hostname.replace(/[^a-zA-Z0-9.-]/g, '_')
            filename = `qrcode_${safeHostname}.png`
          }
        } catch (e) {
          // Use default filename if URL parsing fails
        }
      }
      qrActions.downloadQRCode(filename)
    }
  }

  const handleExportSvg = () => {
    if (!qrState.qrData || !qrState.originalSize) return
    if (plan !== 'pro') {
      upgrade()
      return
    }
    chrome.storage.sync.get(DEFAULT_CONFIG, (cfg) => {
      downloadSvg(
        'qrcode.svg',
        qrState.qrData!,
        qrState.qrSize,
        qrState.originalSize,
        {
          moduleStyle: cfg.moduleStyle,
          locatorStyle: cfg.locatorStyle,
          foreground: cfg.foregroundColor,
          background: cfg.backgroundColor
        },
        getCenterLogoDataUrl()
      )
    })
  }

  const handleContentTypeChange = (next: ContentType) => {
    if (next !== 'text' && plan !== 'pro') {
      upgrade()
      return
    }
    setContentType(next)
  }

  const { error, qrData, qrSize, errorType, isLoading, originalSize } = qrState
  const showInputLengthError =
    Boolean(error) && errorType === ErrorType.InputTooLong
  const hasQRData = Boolean(qrData) && qrSize > 0
  const disabled = !hasQRData || Boolean(isLoading)

  const showQR = mode === 'text'

  return (
    <div className={`chromium-bubble flex w-80 h-[506px] flex-col p-0 leading-5`}>
      <div className='chromium-title-bar flex min-h-10 items-center justify-between border-b border-b-transparent px-4 py-3'>
        <div className='flex items-center gap-2'>
          <h2 className='chromium-title text-sm font-medium' ref={titleRef}>
            {i18n.t('title')}
          </h2>
          <span className='text-xs text-gray-500 opacity-70'>Alt+Shift+Q</span>
        </div>
        <button
          type='button'
          className='chromium-close-button flex h-6 w-6 items-center justify-center rounded-full focus:ring-2 focus:outline-none'
          aria-label={i18n.t('aria_close')}
          onClick={() => window.close()}
        >
          <svg
            className='h-4 w-4'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M18 6L6 18M6 6l12 12' />
          </svg>
        </button>
      </div>

      <div className='flex gap-1 border-b border-b-[var(--chromium-border)] px-3 py-2'>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type='button'
            className={clsx(
              'rounded-full px-3 py-1 text-xs leading-4 transition-colors',
              mode === tab.id
                ? 'bg-[var(--chromium-active)] text-[var(--chromium-focus)]'
                : 'text-[var(--chromium-secondary-text)] hover:bg-[var(--chromium-hover)] hover:text-[var(--chromium-text)]'
            )}
            onClick={() => {
              setMode(tab.id)
              setCopyFeedback('')
            }}
          >
            {i18n.t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className='flex flex-1 min-h-0 flex-col'>
        {showQR ? (
          <>
            <div className='chromium-qr-container relative flex items-center justify-center self-center overflow-hidden border-2 bg-white'>
              <QRCodeCanvas
                {...{
                  qrData,
                  qrSize,
                  errorType,
                  isLoading,
                  originalSize
                }}
                error={error && !showInputLengthError ? error : null}
                ref={canvasRef}
              />
            </div>
            <div className='chromium-input-container'>
              <select
                value={contentType}
                aria-label={i18n.t('content_type_label')}
                onChange={(e) =>
                  handleContentTypeChange(e.target.value as ContentType)
                }
                className='mb-2 w-full rounded border border-[var(--chromium-border)] bg-[var(--chromium-background)] px-2 py-1 text-sm text-[var(--chromium-text)]'
              >
                <option value='text'>{i18n.t('content_type_text')}</option>
                <option value='vcard'>
                  {i18n.t('content_type_vcard')}
                  {plan !== 'pro' ? ' · Pro' : ''}
                </option>
                <option value='event'>
                  {i18n.t('content_type_event')}
                  {plan !== 'pro' ? ' · Pro' : ''}
                </option>
              </select>

              {contentType === 'text' ? (
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  aria-label={i18n.t('aria_input_url_text')}
                  placeholder={i18n.t('placeholder_input_url_text')}
                  maxLength={2000}
                  className='chromium-input text-sm transition-all focus:outline-none'
                />
              ) : contentType === 'vcard' ? (
                <VCardForm data={vcardData} onChange={setVcardData} />
              ) : (
                <EventForm data={eventData} onChange={setEventData} />
              )}
            </div>

            {urlUnavailable && contentType === 'text' && (
              <div className='chromium-input-container mt-1 mb-4'>
                <p className='line-clamp-2 text-xs leading-4 text-[var(--chromium-secondary-text)]'>
                  {i18n.t('page_url_unavailable')}
                </p>
              </div>
            )}

            <div
              className={clsx(
                'chromium-error-container',
                showInputLengthError ? 'show-error' : 'hide-error'
              )}
            >
              {showInputLengthError && (
                <div className='chromium-error-text text-left leading-4'>
                  {error}
                </div>
              )}
            </div>

            <div
              className={clsx(
                'chromium-button-container flex items-center gap-2',
                showInputLengthError || urlUnavailable
                  ? 'with-error'
                  : 'without-error'
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='chromium-tooltip-icon flex items-center justify-center'>
                      <InfoCircledIcon className='h-full w-full' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='top' align='start'>
                    <p className='chromium-tooltip-content'>{i18n.t('tips')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className='flex-1' />
              <Button
                disabled={disabled}
                className='chromium-button min-h-8 min-w-16 rounded-2xl border px-4 py-2 text-center leading-5 disabled:cursor-not-allowed'
                onClick={handleCopy}
              >
                {copyFeedback || i18n.t('copy')}
              </Button>
              <Button
                disabled={disabled}
                className='chromium-button min-h-8 min-w-16 rounded-2xl border px-4 py-2 text-center leading-5 disabled:cursor-not-allowed'
                onClick={handleDownload}
              >
                {i18n.t('download')}
              </Button>
              <Button
                disabled={disabled}
                title={plan !== 'pro' ? i18n.t('pro_locked_hint') : undefined}
                className='chromium-button min-h-8 min-w-16 rounded-2xl border px-4 py-2 text-center leading-5 disabled:cursor-not-allowed'
                onClick={handleExportSvg}
              >
                {plan === 'pro' ? i18n.t('export_svg') : i18n.t('export_svg_pro')}
              </Button>
            </div>
          </>
        ) : mode === 'batch' ? (
          <BatchView plan={plan} onUpgrade={upgrade} />
        ) : mode === 'scan' ? (
          <ScanView
            onUseResult={(text) => {
              setInputValue(text)
              setContentType('text')
              setMode('text')
            }}
          />
        ) : (
          <HistoryView
            onSelect={(text) => {
              setInputValue(text)
              setContentType('text')
              setMode('text')
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
