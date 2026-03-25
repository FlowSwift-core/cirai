interface EasyEDAElement {
  id: string
  type: string
  name?: string
  value?: string
  x?: number
  y?: number
  libraryId?: string
  [key: string]: unknown
}

interface EasyEDADocument {
  id: string
  name: string
  type: 'schematic' | 'pcb' | 'symbol' | 'footprint'
  filePath?: string
  elements: EasyEDAElement[]
}

interface EasyEDASelection {
  elements: EasyEDAElement[]
  count: number
}

interface MockEDAAPI {
  sys_I18n: {
    text: (tag: string, namespace?: string, language?: string, ...args: unknown[]) => string
    getCurrentLanguage: () => Promise<string>
    getAllSupportedLanguages: () => string[]
    isLanguageSupported: (language: string) => boolean
    addLanguageChangedEventListener: (id: string, callback: (newLang: string, lastLang: string) => void, once?: boolean) => void
    removeEventListener: (id: string) => boolean
    importMultilingual: (language: string, source: Record<string, string>) => boolean
    importMultilingualNamespace: (namespace: string, source: Record<string, Record<string, string>>) => boolean
    importMultilingualLanguage: (namespace: string, language: string, source: Record<string, string>) => boolean
  }
  sys_Log: {
    add: (message: string, type?: number) => void
    clear: () => void
    export: (types?: number | number[]) => void
    find: (message: string | string[], types?: number | number[]) => Promise<unknown[]>
    sort: (types?: number | number[]) => Promise<unknown[]>
  }
  sys_Message: {
    showToastMessage: (message: string, messageType?: number, timer?: number, bottomPanel?: number, buttonTitle?: string, buttonCallbackFn?: string) => void
    showFollowMouseTip: (tip: string, msTimeout?: number) => Promise<void>
    removeFollowMouseTip: (tip?: string) => Promise<void>
  }
  sys_ToastMessage: {
    showMessage: (message: string, type?: number) => void
  }
  sys_Environment: {
    getUserInfo: () => {
      username?: string
      nickname?: string
      avatar?: string
      uuid?: string
      customerCode?: string
    }
    getEditorCurrentVersion: () => string
    getEditorCompliedDate: () => string
  }
  sys_Storage: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<void>
    remove: (key: string) => Promise<void>
  }
  sys_FileManager: {
    open: (filePath: string) => Promise<void>
    save: (filePath?: string) => Promise<string>
    saveAs: () => Promise<string>
  }
  sch_Document: {
    getDocument: () => EasyEDADocument
    getFilePath: () => string
    isModified: () => boolean
    newFile: (type: string) => void
  }
  sch_SelectControl: {
    getSelectedObjects: () => EasyEDASelection
    getSelectionCount: () => number
    selectAll: () => void
    clearSelection: () => void
    selectObject: (id: string) => void
    deselectObject: (id: string) => void
  }
  pcb_Document: {
    getDocument: () => EasyEDADocument
    getFilePath: () => string
    isModified: () => boolean
    newFile: (type: string) => void
  }
  pcb_SelectControl: {
    getSelectedObjects: () => EasyEDASelection
    getSelectionCount: () => number
    selectAll: () => void
    clearSelection: () => void
    selectObject: (id: string) => void
    deselectObject: (id: string) => void
  }
  sch_Netlist: {
    getNetlist: (type?: number) => Promise<string>
    setNetlist: (type: number, netlist: string) => Promise<void>
  }
  pcb_Net: {
    getNetlist: (type?: number) => Promise<string>
    setNetlist: (type: number, netlist: string) => Promise<boolean>
  }
  sch_ManufactureData: {
    getNetlistFile: (fileName?: string, netlistType?: number) => Promise<File | undefined>
  }
  pcb_ManufactureData: {
    getNetlistFile: (fileName?: string, _netlistType?: number) => Promise<File | undefined>
  }
  dmt_Project: {
    getCurrentProjectInfo: () => Promise<{
      id?: string
      name?: string
      path?: string
      type?: string
    }>
  }
  dmt_SelectControl: {
    getCurrentDocumentInfo: () => Promise<{
      id?: string
      name?: string
      type?: string
      filePath?: string
      isModified?: boolean
    }>
  }
  dmt_Board: {
    getCurrentBoardInfo: () => Promise<{
      id?: string
      name?: string
      width?: number
      height?: number
      layers?: number
    }>
  }
  dmt_Pcb: {
    getCurrentPcbInfo: () => Promise<{
      id?: string
      name?: string
      primitives?: unknown[]
    }>
  }
  dmt_Schematic: {
    getCurrentSchematicInfo: () => Promise<{
      id?: string
      name?: string
      primitives?: unknown[]
    }>
  }
  dmt_Team: {
    getCurrentTeamInfo: () => Promise<{
      id?: string
      name?: string
      role?: string
    }>
  }
  dmt_Workspace: {
    getCurrentWorkspaceInfo: () => Promise<{
      id?: string
      name?: string
      type?: string
    }>
  }
}

function generateId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

const translations: Record<string, Record<string, string>> = {
  en: {
    'Done': 'Done',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'OK': 'OK',
    'Error': 'Error',
    'Warning': 'Warning',
    'Info': 'Info',
  },
  'zh-CN': {
    'Done': '完成',
    'Save': '保存',
    'Cancel': '取消',
    'OK': '确定',
    'Error': '错误',
    'Warning': '警告',
    'Info': '信息',
  },
}

let currentLanguage = 'en'
const languageListeners: Map<string, (newLang: string, lastLang: string) => void> = new Map()
const storedTranslations: Record<string, Record<string, string>> = {}

const mockDocument: EasyEDADocument = {
  id: 'doc_001',
  name: 'Untitled Project',
  type: 'schematic',
  elements: [],
}

const mockSelection: EasyEDASelection = {
  elements: [],
  count: 0,
}

const createMockEDA = (): MockEDAAPI => {
  let currentDoc = { ...mockDocument }

  return {
    sys_I18n: {
      text: (tag: string, _namespace?: string, _language?: string, ..._args: unknown[]) => {
        const lang = currentLanguage
        if (storedTranslations[lang]?.[tag]) {
          return storedTranslations[lang][tag]
        }
        return translations[lang]?.[tag] || tag
      },
      getCurrentLanguage: () => Promise.resolve(currentLanguage),
      getAllSupportedLanguages: () => Object.keys(translations),
      isLanguageSupported: (language: string) => language in translations,
      addLanguageChangedEventListener: (id: string, callback: (newLang: string, lastLang: string) => void, _once?: boolean) => {
        languageListeners.set(id, callback)
      },
      removeEventListener: (id: string) => languageListeners.delete(id),
      importMultilingual: (language: string, source: Record<string, string>) => {
        if (!storedTranslations[language]) {
          storedTranslations[language] = {}
        }
        Object.assign(storedTranslations[language], source)
        return true
      },
      importMultilingualNamespace: (_namespace: string, source: Record<string, Record<string, string>>) => {
        for (const lang in source) {
          if (!storedTranslations[lang]) {
            storedTranslations[lang] = {}
          }
          Object.assign(storedTranslations[lang], source[lang])
        }
        return true
      },
      importMultilingualLanguage: (_namespace: string, _language: string, _source: Record<string, string>) => {
        return true
      },
    },
    sys_Log: {
      add: (message: string, type?: number) => {
        const level = type === 1 ? 'ERROR' : type === 2 ? 'WARN' : 'INFO'
        console.log(`[EDA Log ${level}]`, message)
      },
      clear: () => {
        console.log('[EDA Log] Cleared')
      },
      export: (_types?: number | number[]) => {
        console.log('[EDA Log] Exported')
      },
      find: async (_message: string | string[], _types?: number | number[]) => {
        return []
      },
      sort: async (_types?: number | number[]) => {
        return []
      },
    },
    sys_Message: {
      showToastMessage: (message: string, _messageType?: number, _timer?: number, _bottomPanel?: number, _buttonTitle?: string, _buttonCallbackFn?: string) => {
        console.log('[EDA Toast]', message)
        if (typeof window !== 'undefined') {
          const toast = document.createElement('div')
          toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 9999;
            font-family: system-ui, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          `
          toast.textContent = message
          document.body.appendChild(toast)
          setTimeout(() => toast.remove(), 3000)
        }
      },
      showFollowMouseTip: async (_tip: string, _msTimeout?: number) => {
        console.log('[EDA MouseTip] shown')
      },
      removeFollowMouseTip: async (_tip?: string) => {
        console.log('[EDA MouseTip] removed')
      },
    },
    sys_ToastMessage: {
      showMessage: (message: string, _type?: number) => {
        console.log('[EDA ToastMessage]', message)
      },
    },
    sys_Environment: {
      getUserInfo: () => ({
        username: 'test-user',
        nickname: 'Test User',
        avatar: '',
        uuid: 'mock-uuid-12345',
        customerCode: 'FREE',
      }),
      getEditorCurrentVersion: () => '1.0.0',
      getEditorCompliedDate: () => '2024-01-01',
    },
    sys_Storage: {
      get: async (key: string) => {
        const data = localStorage.getItem(`eda_${key}`)
        return data ? JSON.parse(data) : null
      },
      set: async (key: string, value: unknown) => {
        localStorage.setItem(`eda_${key}`, JSON.stringify(value))
      },
      remove: async (key: string) => {
        localStorage.removeItem(`eda_${key}`)
      },
    },
    sys_FileManager: {
      open: async (_filePath: string) => {
        console.log('[EDA FileManager] Open file')
      },
      save: async (_filePath?: string) => {
        console.log('[EDA FileManager] Save file')
        return currentDoc.filePath || 'untitled.json'
      },
      saveAs: async () => {
        console.log('[EDA FileManager] Save as')
        return 'untitled.json'
      },
    },
    sch_Document: {
      getDocument: () => ({ ...currentDoc, type: 'schematic' as const }),
      getFilePath: () => currentDoc.filePath || '',
      isModified: () => false,
      newFile: (type: string) => {
        currentDoc = {
          id: generateId(),
          name: 'Untitled',
          type: type as 'schematic' | 'pcb' | 'symbol' | 'footprint',
          elements: [],
        }
      },
    },
    sch_SelectControl: {
      getSelectedObjects: () => ({ ...mockSelection }),
      getSelectionCount: () => 0,
      selectAll: () => console.log('[EDA Select] Select all'),
      clearSelection: () => console.log('[EDA Select] Clear selection'),
      selectObject: (id: string) => console.log('[EDA Select] Select', id),
      deselectObject: (id: string) => console.log('[EDA Select] Deselect', id),
    },
    pcb_Document: {
      getDocument: () => ({ ...currentDoc, type: 'pcb' as const }),
      getFilePath: () => currentDoc.filePath || '',
      isModified: () => false,
      newFile: (type: string) => {
        currentDoc = {
          id: generateId(),
          name: 'Untitled',
          type: type as 'schematic' | 'pcb' | 'symbol' | 'footprint',
          elements: [],
        }
      },
    },
    pcb_SelectControl: {
      getSelectedObjects: () => ({ ...mockSelection }),
      getSelectionCount: () => 0,
      selectAll: () => console.log('[EDA PCB Select] Select all'),
      clearSelection: () => console.log('[EDA PCB Select] Clear selection'),
      selectObject: (id: string) => console.log('[EDA PCB Select] Select', id),
      deselectObject: (id: string) => console.log('[EDA PCB Select] Deselect', id),
    },
    sch_Netlist: {
      getNetlist: async (_type?: number) => {
        return `!Protel Netlist
!Created: ${new Date().toISOString()}
!
{ netlist }
  GND
  VCC
  NetC1_1
  NetC1_2
{ component }
C1         Capacitor        10uF
R1         Resistor         10K
U1         IC               NE555
`
      },
      setNetlist: async (_type: number, _netlist: string) => {
        console.log('[EDA Netlist] setNetlist called (mock)')
      },
    },
    pcb_Net: {
      getNetlist: async (_type?: number) => {
        return `!Protel Netlist
!Created: ${new Date().toISOString()}
!
{ netlist }
  GND
  VCC
{ component }
C1         C0402          10uF
R1         R0402          10K
U1         SOIC-8         NE555
`
      },
      setNetlist: async (_type: number, _netlist: string) => {
        console.log('[EDA Net] setNetlist called (mock)')
        return true
      },
    },
    sch_ManufactureData: {
      getNetlistFile: async (fileName?: string, _netlistType?: number) => {
        const netlist = await createMockEDA().sch_Netlist.getNetlist()
        const name = fileName || 'netlist.txt'
        const blob = new Blob([netlist], { type: 'text/plain' })
        return new File([blob], name, { type: 'text/plain' })
      },
    },
    pcb_ManufactureData: {
      getNetlistFile: async (fileName?: string, _netlistType?: number) => {
        const netlist = await createMockEDA().pcb_Net.getNetlist()
        const name = fileName || 'netlist.txt'
        const blob = new Blob([netlist], { type: 'text/plain' })
        return new File([blob], name, { type: 'text/plain' })
      },
    },
    dmt_Project: {
      getCurrentProjectInfo: async () => ({
        id: 'proj_001',
        name: 'Mock Project',
        path: '/projects/mock-project',
        type: 'pcb',
      }),
    },
    dmt_SelectControl: {
      getCurrentDocumentInfo: async () => ({
        id: 'doc_001',
        name: 'Main Schematic',
        type: 'schematic',
        filePath: '/projects/mock-project/main.sch',
        isModified: false,
      }),
    },
    dmt_Board: {
      getCurrentBoardInfo: async () => ({
        id: 'board_001',
        name: 'Main Board',
        width: 100,
        height: 80,
        layers: 2,
      }),
    },
    dmt_Pcb: {
      getCurrentPcbInfo: async () => ({
        id: 'pcb_001',
        name: 'Main PCB',
        primitives: [],
      }),
    },
    dmt_Schematic: {
      getCurrentSchematicInfo: async () => ({
        id: 'sch_001',
        name: 'Main Schematic',
        primitives: [],
      }),
    },
    dmt_Team: {
      getCurrentTeamInfo: async () => ({
        id: 'team_001',
        name: 'Mock Team',
        role: 'owner',
      }),
    },
    dmt_Workspace: {
      getCurrentWorkspaceInfo: async () => ({
        id: 'ws_001',
        name: 'Mock Workspace',
        type: 'personal',
      }),
    },
  }
}

const createProxy = <T extends object>(target: T, path: string = 'eda'): T => {
  return new Proxy(target, {
    get(_target, prop) {
      const key = String(prop)
      const value = (target as Record<string, unknown>)[key]
      if (value !== undefined) {
        return typeof value === 'object' && value !== null
          ? createProxy(value as object, `${path}.${key}`)
          : value
      }
      throw new Error(
        `API "${path}.${key}" 不存在。请在 EDA 编辑器环境中使用，或在 mock 中实现该 API。提示：完整的 API 列表请参考 @jlceda/pro-api-types`
      )
    },
  })
}

export const isInEDA = (): boolean => {
  return typeof window !== 'undefined' && 'eda' in window
}

export const getEDA = (): MockEDAAPI => {
  if (isInEDA()) {
    return (window as unknown as { eda: MockEDAAPI }).eda
  }
  return createProxy(createMockEDA())
}

export const eda = getEDA()

export default eda