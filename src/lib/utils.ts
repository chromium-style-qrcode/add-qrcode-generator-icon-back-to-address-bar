import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const compressImage = (
  file: File,
  maxSize: number = 80,
  quality: number = 0.8
) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    img.onload = () => {
      const canvas = document.createElement('canvas')

      let { width, height } = img
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        }
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height)
        height = maxSize
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      const dataUrl = canvas.toDataURL('image/png', quality)

      if (dataUrl.length > 8000) {
        if (maxSize > 40) {
          compressImage(file, maxSize - 20, quality - 0.1)
            .then(resolve)
            .catch(reject)
        } else {
          reject(new Error('Image too large even after compression'))
        }
        return
      }

      resolve(dataUrl)
    }
    reader.onload = ({ target }) => {
      img.src = target?.result as string
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    reader.onerror = () => reject(new Error('Failed to read file'))

    reader.readAsDataURL(file)
  })

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
