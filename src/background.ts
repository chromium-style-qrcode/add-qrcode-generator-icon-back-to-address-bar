// Background script to handle keyboard shortcuts
export default defineBackground(() => {
  // Get command ID from environment variable
  const QRCODE_COMMAND_ID = import.meta.env.VITE_QRCODE_COMMAND_ID

  // Set uninstall feedback form URL when extension is installed
  const UNINSTALL_FEEDBACK_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLScYpEm7Z14Eqqw1jePSgCamILRwtBN1m80Ybn5OK1XXlQWskw/viewform'

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
      // Set the URL to open when user uninstalls the extension
      if (chrome.runtime.setUninstallURL) {
        chrome.runtime.setUninstallURL(UNINSTALL_FEEDBACK_FORM_URL)
      }
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
