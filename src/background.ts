// Background script to handle keyboard shortcuts
export default defineBackground(() => {
  // Get command ID from environment variable
  const QRCODE_COMMAND_ID = import.meta.env.VITE_QRCODE_COMMAND_ID

  // Listen for keyboard shortcut commands
  chrome.commands?.onCommand.addListener((command: string) => {
    if (command === QRCODE_COMMAND_ID) {
      // Open the popup when the shortcut is pressed
      chrome.action?.openPopup()
    }
  })
})
