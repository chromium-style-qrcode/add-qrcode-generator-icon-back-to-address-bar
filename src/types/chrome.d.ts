declare global {
  interface Tab {
    url?: string
    id?: number
  }

  interface Window {
    chrome?: {
      tabs: {
        query: (
          queryInfo: { active: boolean; currentWindow: boolean },
          callback: (tabs: Tab[]) => void
        ) => void
      }
    }
  }

  const chrome: {
    tabs: {
      query: (
        queryInfo: { active: boolean; currentWindow: boolean },
        callback: (tabs: Tab[]) => void
      ) => void
      sendMessage: (
        tabId: number,
        message: Record<string, unknown>,
        callback?: (response: unknown) => void
      ) => void
    }
    storage: {
      sync: {
        get: <T>(keys: T, callback: (result: T) => void) => void
        set: (items: any, callback?: () => void) => void
      }
      local: {
        get: (keys: string | string[]) => Promise<Record<string, any>>
        set: (items: Record<string, any>) => Promise<void>
        remove: (keys: string | string[]) => Promise<void>
      }
      session: {
        get: (keys: string | string[]) => Promise<Record<string, any>>
        set: (items: Record<string, any>) => Promise<void>
        remove: (keys: string | string[]) => Promise<void>
      }
      onChanged?: {
        addListener: (callback: (changes: any, area: string) => void) => void
        removeListener: (callback: (changes: any, area: string) => void) => void
      }
    }
    runtime: {
      getURL: (path: string) => string
      onInstalled: {
        addListener: (callback: (details: { reason?: string }) => void) => void
      }
      setUninstallURL?: (url: string) => void
      onMessage: {
        addListener: (
          callback: (
            message: Record<string, unknown>,
            sender: unknown,
            sendResponse: (response: unknown) => void
          ) => boolean | undefined
        ) => void
      }
    }
    commands?: {
      onCommand: {
        addListener: (callback: (command: string) => void) => void
      }
    }
    action?: {
      openPopup: () => Promise<void>
    }
    contextMenus: {
      create: (options: Record<string, unknown>, callback?: () => void) => void
      removeAll: (callback?: () => void) => void
      onClicked: {
        addListener: (
          callback: (
            info: { menuItemId: string | number; selectionText?: string },
            tab?: Tab
          ) => void
        ) => void
      }
    }
    omnibox: {
      setDefaultSuggestion: (suggestion: { description: string }) => void
      onInputChanged: {
        addListener: (
          callback: (text: string, suggest: (suggestions: unknown[]) => void) => void
        ) => void
      }
      onInputEntered: {
        addListener: (callback: (text: string, disposition?: string) => void) => void
      }
    }
  }
}

export {}
