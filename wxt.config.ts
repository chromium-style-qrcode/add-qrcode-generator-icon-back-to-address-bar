import { defineConfig } from 'wxt'
import { config } from 'dotenv'

// Load environment variables
config()

// Log warning if using default values
if (!process.env.VITE_QRCODE_COMMAND_ID) {
  console.warn('⚠️  VITE_QRCODE_COMMAND_ID not set')
}
if (!process.env.VITE_QRCODE_SHORTCUT) {
  console.warn('⚠️  VITE_QRCODE_SHORTCUT not set')
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    default_locale: 'en',
    permissions: ['activeTab', 'storage'],
    action: { default_popup: 'popup/index.html' },
    options_ui: {
      open_in_tab: true,
      page: 'configuration.html'
    },
    name: 'Add QR Code Generator Icon Back To Address Bar',
    description:
      'A Extension To Add QR Code Generator Icon Back To Address Bar',
    commands: {
      [process.env.VITE_QRCODE_COMMAND_ID!]: {
        suggested_key: {
          mac: process.env.VITE_QRCODE_SHORTCUT,
          default: process.env.VITE_QRCODE_SHORTCUT
        },
        description: 'Show QR code for current page'
      }
    },
    web_accessible_resources: [
      {
        resources: ['wasm/*'],
        matches: ['<all_urls>']
      }
    ],
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
    }
  },
  modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
  entrypointsDir: 'src',
  webExt: { disabled: true },
  vite: () => ({
    server: {
      fs: {
        allow: ['..']
      }
    },
    assetsInclude: ['**/*.wasm']
  }),
  zip: {
    artifactTemplate: '{{name}}-{{packageVersion}}.zip',
    sourcesTemplate: '{{name}}-{{packageVersion}}-sources.zip'
  }
})
