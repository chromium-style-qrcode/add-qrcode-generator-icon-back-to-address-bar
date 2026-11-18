import JSZip from 'jszip'
import {
  generateBatchQRCodes,
  renderQRCodeToCanvas
} from '../hooks/use-qrcode'
import type { LocatorStyleOption, ModuleStyleOption } from '../constant/default'

// Geometry mirrors the canvas renderer (see use-qrcode.ts) so the SVG matches
// the PNG pixel-for-pixel.
const MODULE = 10
const QUIET = 40
const LOCATOR = 7

interface SvgOptions {
  moduleStyle: ModuleStyleOption
  locatorStyle: LocatorStyleOption
  foreground: string
  background: string
}

const isLocatorModule = (x: number, y: number, size: number): boolean =>
  (x < LOCATOR && y < LOCATOR) ||
  (x >= size - LOCATOR && y < LOCATOR) ||
  (x < LOCATOR && y >= size - LOCATOR)

/**
 * Build an SVG document for the QR matrix. When `logoDataUrl` is provided it
 * is embedded in the center (the logo is raster, so it is inlined as a PNG
 * data URL rather than vectorized).
 */
export const qrToSvg = (
  qrData: Uint8Array,
  size: number,
  originalSize: number,
  opts: SvgOptions,
  logoDataUrl?: string | null
): string => {
  const hasQuietZone = size > originalSize
  const quietModules = hasQuietZone ? (size - originalSize) / 2 : 0
  const total = originalSize * MODULE + QUIET * 2

  const radius = opts.locatorStyle === 'square' ? 0 : MODULE

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="geometricPrecision">`,
    `<rect width="${total}" height="${total}" fill="${opts.background}"/>`
  ]

  // Data modules (locator zones are drawn separately below).
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!(qrData[y * size + x]! & 0x1)) continue
      let ox: number
      let oy: number
      if (hasQuietZone) {
        ox = x - quietModules
        oy = y - quietModules
        if (ox < 0 || oy < 0 || ox >= originalSize || oy >= originalSize) continue
      } else {
        ox = x
        oy = y
      }
      if (isLocatorModule(ox, oy, originalSize)) continue

      const cx = QUIET + (ox + 0.5) * MODULE
      const cy = QUIET + (oy + 0.5) * MODULE
      if (opts.moduleStyle === 'circles') {
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${MODULE / 2 - 1}" fill="${opts.foreground}"/>`)
      } else {
        parts.push(
          `<rect x="${QUIET + ox * MODULE}" y="${QUIET + oy * MODULE}" width="${MODULE}" height="${MODULE}" fill="${opts.foreground}"/>`
        )
      }
    }
  }

  // Finder (locator) patterns at the three corners.
  const locator = (lx: number, ty: number) => {
    let left = lx * MODULE
    let top = ty * MODULE
    let dim = MODULE * LOCATOR

    parts.push(
      `<rect x="${QUIET + left}" y="${QUIET + top}" width="${dim}" height="${dim}" rx="${radius}" fill="${opts.foreground}"/>`
    )
    left += MODULE
    top += MODULE
    dim -= 2 * MODULE
    parts.push(
      `<rect x="${QUIET + left}" y="${QUIET + top}" width="${dim}" height="${dim}" rx="${radius}" fill="${opts.background}"/>`
    )
    left += MODULE
    top += MODULE
    dim -= 2 * MODULE
    parts.push(
      `<rect x="${QUIET + left}" y="${QUIET + top}" width="${dim}" height="${dim}" rx="${radius}" fill="${opts.foreground}"/>`
    )
  }

  locator(0, 0)
  locator(originalSize - LOCATOR, 0)
  locator(0, originalSize - LOCATOR)

  // Center logo overlay (drawn last so it sits above the data modules).
  if (logoDataUrl) {
    const logoW = 80
    const logoH = 88
    const destX = (total - logoW) / 2
    const destY = (total - logoH) / 2
    const bgLeft = Math.floor((destX - 2) / MODULE) * MODULE
    const bgTop = Math.floor((destY - 2) / MODULE) * MODULE
    const bgRight = Math.ceil((destX + logoW + 2) / MODULE) * MODULE
    const bgBottom = Math.ceil((destY + logoH + 2) / MODULE) * MODULE
    parts.push(
      `<rect x="${bgLeft}" y="${bgTop}" width="${bgRight - bgLeft}" height="${bgBottom - bgTop}" fill="${opts.background}"/>`
    )
    parts.push(
      `<image href="${logoDataUrl}" x="${destX}" y="${destY}" width="${logoW}" height="${logoH}" preserveAspectRatio="none"/>`
    )
  }

  parts.push('</svg>')
  return parts.join('')
}

export const downloadSvg = (
  filename: string,
  qrData: Uint8Array,
  qrSize: number,
  originalSize: number,
  opts: SvgOptions,
  logoDataUrl?: string | null
): void => {
  const svg = qrToSvg(qrData, qrSize, originalSize, opts, logoDataUrl)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Render the QR code to `canvas` at a given integer scale factor using
 * nearest-neighbour upscaling, which keeps QR modules crisp (no blurring).
 */
export const renderQRCodeScaled = (
  canvas: HTMLCanvasElement,
  qrData: Uint8Array,
  qrSize: number,
  originalSize: number,
  scale: number
): void => {
  const base = document.createElement('canvas')
  renderQRCodeToCanvas(base, qrData, qrSize, originalSize)

  canvas.width = Math.round(base.width * scale)
  canvas.height = Math.round(base.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(base, 0, 0, canvas.width, canvas.height)
}

export const downloadScaledPng = (
  filename: string,
  qrData: Uint8Array,
  qrSize: number,
  originalSize: number,
  scale: number
): void => {
  const canvas = document.createElement('canvas')
  renderQRCodeScaled(canvas, qrData, qrSize, originalSize, scale)
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = filename
  link.click()
}

/**
 * Generate PNGs for a list of texts and bundle them into a single zip. This is
 * a Pro feature (batch generation).
 */
export const exportBatchPng = async (texts: string[]): Promise<void> => {
  const zip = new JSZip()
  let index = 0

  await generateBatchQRCodes(texts, async (data, size, originalSize) => {
    const canvas = document.createElement('canvas')
    renderQRCodeToCanvas(canvas, data, size, originalSize)
    const base64 = canvas.toDataURL('image/png').split(',')[1]
    if (!base64) return
    index += 1
    zip.file(`qrcode_${String(index).padStart(3, '0')}.png`, base64, {
      base64: true
    })
  })

  if (index === 0) return

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'qrcodes.zip'
  link.click()
  URL.revokeObjectURL(url)
}
