import jsQR from 'jsqr'

// Content script that decodes QR codes on the current page on demand.
// It only runs when the popup sends a SCAN_PAGE_FOR_QR message; otherwise it
// is idle (a single message listener with negligible overhead).
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    const MIN_SIDE = 40
    const MAX_SIDE = 2000

    let nativeDetector: BarcodeDetector | null = null
    if (typeof BarcodeDetector !== 'undefined') {
      try {
        nativeDetector = new BarcodeDetector({ formats: ['qr_code'] })
      } catch {
        nativeDetector = null
      }
    }

    const decodeNative = async (
      source: ImageBitmapSource
    ): Promise<string | null> => {
      if (!nativeDetector) return null
      try {
        const results = await nativeDetector.detect(source)
        return results.length > 0 ? results[0]!.rawValue : null
      } catch {
        return null
      }
    }

    const decodeCanvasJsQR = (canvas: HTMLCanvasElement): string | null => {
      const { width, height } = canvas
      if (width < MIN_SIDE || height < MIN_SIDE) return null
      if (width > MAX_SIDE || height > MAX_SIDE) return null

      try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return null
        const imgData = ctx.getImageData(0, 0, width, height)
        const result = jsQR(imgData.data, width, height)
        return result?.data ?? null
      } catch {
        return null
      }
    }

    const collectCandidates = () => {
      const canvases = Array.from(
        document.querySelectorAll('canvas')
      ) as HTMLCanvasElement[]

      const images = (
        Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
      )
        .filter(
          (img) =>
            img.complete &&
            img.naturalWidth >= MIN_SIDE &&
            img.naturalHeight >= MIN_SIDE &&
            img.naturalWidth <= MAX_SIDE &&
            img.naturalHeight <= MAX_SIDE
        )
        .sort(
          (a, b) =>
            b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight
        )
        .slice(0, 40)

      return { canvases, images }
    }

    const scanPage = async (): Promise<string | null> => {
      const { canvases, images } = collectCandidates()

      // Native path: pass the element directly. This decodes Chromium-style
      // QR codes (round modules / rounded finder patterns / centered logo) and
      // works on cross-origin images (no canvas tainting involved).
      if (nativeDetector) {
        for (const canvas of canvases) {
          const text = await decodeNative(canvas)
          if (text) return text
        }
        for (const img of images) {
          const text = await decodeNative(img)
          if (text) return text
        }
        return null
      }

      // jsQR fallback: only same-origin / data-URL sources are readable.
      for (const canvas of canvases) {
        const text = decodeCanvasJsQR(canvas)
        if (text) return text
      }
      for (const img of images) {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (!ctx) continue
          ctx.drawImage(img, 0, 0)
          const text = decodeCanvasJsQR(canvas)
          if (text) return text
        } catch {
          // Cross-origin image tainted the canvas; skip.
        }
      }
      return null
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message && typeof message === 'object' && message.type === 'SCAN_PAGE_FOR_QR') {
        scanPage()
          .then((text) => sendResponse({ ok: true, text }))
          .catch((error) => sendResponse({ ok: false, error: String(error) }))
        return true // keep the channel open for the async response
      }
      return undefined
    })
  }
})
