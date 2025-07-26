import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['activeTab'],
    action: { default_popup: 'popup/index.html' },
    name: 'Add QR Code Generator Icon Back To Address Bar',
    description:
      'A Extension To Add QR Code Generator Icon Back To Address Bar',
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
  modules: ['@wxt-dev/module-react'],
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
    artifactTemplate: '{{name}}-{{packageVersion}}-{{browser}}.zip',
    sourcesTemplate: '{{name}}-{{packageVersion}}-{{browser}}-sources.zip'
  }
})
