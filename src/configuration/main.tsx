import React from 'react'
import { createRoot } from 'react-dom/client'

import Options from '../components/ui/options'
import ThemeProvider from '../providers/theme'

import '../styles/base.css'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Options />
    </ThemeProvider>
  </React.StrictMode>
)
