// Static WASM loader that directly imports the generated module
import {
  QuietZone,
  initialize,
  CenterImage,
  ModuleStyle,
  LocatorStyle,
  generateQRCode
} from '@chromium-style-qrcode/generator'

export interface QRCodeResult {
  data: Uint8Array
  size: number
  original_size: number
}

export interface WasmQRGenerator {
  QuietZone: {
    WillBeAddedByClient: number
    Included: number
  }
  CenterImage: {
    Dino: number
    None: number
  }
  ModuleStyle: {
    Circles: number
    Squares: number
  }
  LocatorStyle: {
    Rounded: number
    Square: number
  }
  generate_qr_code_with_options: (
    text: string,
    moduleStyle: number,
    locatorStyle: number,
    centerImage: number,
    quietZone: number
  ) => QRCodeResult
}

let cachedModule: WasmQRGenerator | null = null

export const loadWasmModuleStatic = async (): Promise<WasmQRGenerator> => {
  if (cachedModule) {
    return cachedModule
  }

  try {
    // Get the correct WASM file path
    const getResourceUrl = (path: string) => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        return chrome.runtime.getURL(path)
      }
      return path.startsWith('/') ? path : `/${path}`
    }

    const wasmPath = getResourceUrl('wasm/qrcode_bg.wasm')

    // Initialize the WASM module
    await initialize(wasmPath)

    console.log('WASM module loaded successfully via static import')

    cachedModule = {
      QuietZone: {
        WillBeAddedByClient: QuietZone.WillBeAddedByClient,
        Included: QuietZone.Included
      },
      CenterImage: {
        Dino: CenterImage.Dino,
        None: CenterImage.NoCenterImage
      },
      ModuleStyle: {
        Circles: ModuleStyle.Circles,
        Squares: ModuleStyle.Squares
      },
      LocatorStyle: {
        Rounded: LocatorStyle.Rounded,
        Square: LocatorStyle.Square
      },
      generate_qr_code_with_options: (
        text: string,
        moduleStyle: number,
        locatorStyle: number,
        centerImage: number,
        quietZone: number
      ) => {
        const result = generateQRCode(text, {
          moduleStyle,
          locatorStyle,
          centerImage,
          quietZone
        })

        return {
          data: result.data,
          size: result.size,
          original_size: result.original_size
        }
      }
    }

    return cachedModule
  } catch (error) {
    console.warn('Static WASM import failed:', error)
    throw error
  }
}
