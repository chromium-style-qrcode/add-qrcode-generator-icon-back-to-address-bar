import jsQR from 'jsqr'

export const decodeQRFromImage = async (file: File): Promise<string> => {
  // Prefer the native BarcodeDetector: it reliably decodes the extension's own
  // Chromium-style QR codes (round modules, rounded finder patterns, centered
  // logo), which jsQR struggles with.
  if (typeof BarcodeDetector !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file)
      try {
        const detector = new BarcodeDetector({ formats: ['qr_code'] })
        const results = await detector.detect(bitmap)
        if (results.length > 0) return results[0]!.rawValue
      } finally {
        bitmap.close()
      }
    } catch (error) {
      console.warn('BarcodeDetector failed, falling back to jsQR:', error)
    }
  }

  // Fallback: jsQR for standard square QR codes.
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)

  if (!result || !result.data) {
    throw new Error('No QR code found in image')
  }

  return result.data
}
