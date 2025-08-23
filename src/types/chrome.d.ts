declare global {
  interface Window {
    chrome?: {
      tabs: {
        query: (
          queryInfo: { active: boolean; currentWindow: boolean },
          callback: (tabs: Array<{ url?: string }>) => void
        ) => void
      }
      storage?: {
        sync: {
          get: (keys: any, callback: (result: any) => void) => void
          set: (items: any, callback?: () => void) => void
        }
        onChanged?: {
          addListener: (callback: (changes: any, area: string) => void) => void
          removeListener: (
            callback: (changes: any, area: string) => void
          ) => void
        }
      }
      runtime?: {
        getURL: (path: string) => string
      }
      commands?: {
        onCommand: {
          addListener: (callback: (command: string) => void) => void
        }
      }
      action?: {
        openPopup: () => void
      }
    }
  }

  const chrome: {
    tabs: {
      query: (
        queryInfo: { active: boolean; currentWindow: boolean },
        callback: (tabs: Array<{ url?: string }>) => void
      ) => void
    }
    storage?: {
      sync: {
        set: (items: any, callback?: () => void) => void
        get: <T>(keys: T, callback: (result: T) => void) => void
      }
      onChanged?: {
        addListener: (callback: (changes: any, area: string) => void) => void
        removeListener: (callback: (changes: any, area: string) => void) => void
      }
    }
    runtime?: {
      getURL: (path: string) => string
    }
    commands?: {
      onCommand: {
        addListener: (callback: (command: string) => void) => void
      }
    }
    action?: {
      openPopup: () => void
    }
  }
}

export {}
