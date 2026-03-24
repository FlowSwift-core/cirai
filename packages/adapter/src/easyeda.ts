export interface EasyEDAElement {
  id: string
  type: string
  name?: string
  value?: string
  x?: number
  y?: number
  libraryId?: string
  [key: string]: unknown
}

export interface EasyEDADocument {
  id: string
  name: string
  type: 'schematic' | 'pcb' | 'symbol' | 'footprint'
  filePath?: string
  elements: EasyEDAElement[]
}

export interface EasyEDASelection {
  elements: EasyEDAElement[]
  count: number
}

export interface EasyEDAUIMessageOptions {
  title?: string
  message: string
  type?: 'info' | 'warning' | 'error'
}

export interface EasyEDASchematicAPI {
  getDocument(): EasyEDADocument
  getSelection(): EasyEDASelection
  addComponent(params: { libraryId: string; x: number; y: number }): EasyEDAElement
  deleteElement(id: string): boolean
}

export interface EasyEDAPCBAPI {
  getDocument(): EasyEDADocument
  getSelection(): EasyEDASelection
  addComponent(params: { libraryId: string; x: number; y: number }): EasyEDAElement
  deleteElement(id: string): boolean
}

export interface EasyEDAUIIAPI {
  showMessage(options: EasyEDAUIMessageOptions): void
  showConfirm(options: EasyEDAUIMessageOptions & { onConfirm: () => void }): void
}

export interface EasyEDAAPI {
  schematic: EasyEDASchematicAPI
  pcb: EasyEDAPCBAPI
  ui: EasyEDAUIIAPI
  getDocument(): EasyEDADocument
  getSelection(): EasyEDASelection
}

function generateId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

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

export const createMockEDA = (): EasyEDAAPI => {
  let currentDoc = { ...mockDocument }

  return {
    schematic: {
      getDocument: () => ({ ...currentDoc, type: 'schematic' as const }),
      getSelection: () => ({ ...mockSelection }),
      addComponent: ({ libraryId, x, y }) => {
        const element: EasyEDAElement = {
          id: generateId(),
          type: 'component',
          libraryId,
          x,
          y,
          name: 'U?',
          value: 'Unknown',
        }
        currentDoc.elements.push(element)
        return element
      },
      deleteElement: (id: string) => {
        const idx = currentDoc.elements.findIndex(e => e.id === id)
        if (idx >= 0) {
          currentDoc.elements.splice(idx, 1)
          return true
        }
        return false
      },
    },
    pcb: {
      getDocument: () => ({ ...currentDoc, type: 'pcb' as const }),
      getSelection: () => ({ ...mockSelection }),
      addComponent: ({ libraryId, x, y }) => {
        const element: EasyEDAElement = {
          id: generateId(),
          type: 'component',
          libraryId,
          x,
          y,
        }
        currentDoc.elements.push(element)
        return element
      },
      deleteElement: (id: string) => {
        const idx = currentDoc.elements.findIndex(e => e.id === id)
        if (idx >= 0) {
          currentDoc.elements.splice(idx, 1)
          return true
        }
        return false
      },
    },
    ui: {
      showMessage: (options) => {
        console.log('[EDA Message]', options.type || 'info', options.title || '', options.message)
      },
      showConfirm: (options) => {
        console.log('[EDA Confirm]', options.title || '', options.message)
        options.onConfirm()
      },
    },
    getDocument: () => ({ ...currentDoc }),
    getSelection: () => ({ ...mockSelection }),
  }
}

export const eda = createMockEDA()

export default eda
