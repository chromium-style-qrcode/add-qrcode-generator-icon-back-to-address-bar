import { i18n } from '#i18n'

// Background script to handle keyboard shortcuts, context menus, and omnibox
export default defineBackground(() => {
  // Get command ID from environment variable
  const QRCODE_COMMAND_ID = import.meta.env.VITE_QRCODE_COMMAND_ID

  // Set uninstall feedback form URL when extension is installed
  const UNINSTALL_FEEDBACK_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLScYpEm7Z14Eqqw1jePSgCamILRwtBN1m80Ybn5OK1XXlQWskw/viewform'

  const CONTEXT_MENU_PAGE = 'qrcode-generate-page'
  const CONTEXT_MENU_SELECTION = 'qrcode-generate-selection'

  // Stash optional text so the popup pre-fills it, then open the popup.
  // `openPopup` requires a user gesture (context menu click / omnibox enter
  // / keyboard shortcut all qualify).
  const openPopupWithInput = async (input?: string) => {
    try {
      if (input) {
        await chrome.storage.session.set({ pendingInput: input })
      } else {
        await chrome.storage.session.remove('pendingInput')
      }
    } catch (error) {
      console.error('Failed to set pending input:', error)
    }

    try {
      await chrome.action?.openPopup()
    } catch (error) {
      // If opening the popup is not allowed here, the pre-filled input above
      // still applies the next time the user opens the popup manually.
      console.warn('Could not open popup automatically:', error)
    }
  }

  const setupContextMenus = () => {
    chrome.contextMenus?.removeAll(() => {
      chrome.contextMenus?.create({
        id: CONTEXT_MENU_PAGE,
        title: i18n.t('context_menu_page'),
        contexts: ['page']
      })
      chrome.contextMenus?.create({
        id: CONTEXT_MENU_SELECTION,
        title: i18n.t('context_menu_selection'),
        contexts: ['selection']
      })
    })
  }

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
      // Set the URL to open when user uninstalls the extension
      if (chrome.runtime.setUninstallURL) {
        chrome.runtime.setUninstallURL(UNINSTALL_FEEDBACK_FORM_URL)
      }
      setupContextMenus()
    }
  })

  // Listen for context menu clicks
  chrome.contextMenus?.onClicked.addListener((info) => {
    if (info.menuItemId === CONTEXT_MENU_PAGE) {
      // No explicit input: the popup auto-fills the current page URL.
      openPopupWithInput()
    } else if (info.menuItemId === CONTEXT_MENU_SELECTION) {
      openPopupWithInput(info.selectionText || '')
    }
  })

  // Omnibox integration: typing "qr" + Space/Tab activates this extension
  chrome.omnibox?.onInputChanged.addListener((_text, suggest) => {
    chrome.omnibox?.setDefaultSuggestion({
      description: i18n.t('omnibox_default_suggestion')
    })
    // No dynamic suggestions for a QR generator.
    suggest([])
  })

  chrome.omnibox?.onInputEntered.addListener((text) => {
    const trimmed = text.trim()
    if (trimmed) {
      openPopupWithInput(trimmed)
    } else {
      openPopupWithInput()
    }
  })

  // Listen for keyboard shortcut commands
  chrome.commands?.onCommand.addListener((command: string) => {
    if (command === QRCODE_COMMAND_ID) {
      // Open the popup when the shortcut is pressed
      chrome.action?.openPopup()
    }
  })
})
