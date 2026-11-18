/**
 * Default configuration constants for the QR Code Generator extension
 */

export const DEFAULT_SHOW_LOGO = true

export type ModuleStyleOption = 'circles' | 'squares'
export type LocatorStyleOption = 'rounded' | 'square'

export const DEFAULT_CONFIG = {
  showLogo: DEFAULT_SHOW_LOGO,
  /** `customLogo` stores a data URL (string) or null when no custom logo is set */
  customLogo: null as string | null,
  /** Style of data modules: circles (Chromium default) or squares */
  moduleStyle: 'circles' as ModuleStyleOption,
  /** Style of locator (corner) patterns: rounded (Chromium default) or square */
  locatorStyle: 'rounded' as LocatorStyleOption,
  /** Foreground (dark) color of the QR code */
  foregroundColor: '#000000',
  /** Background (light) color of the QR code */
  backgroundColor: '#FFFFFF'
}
