/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QRCODE_SHORTCUT: string
  readonly VITE_QRCODE_COMMAND_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
