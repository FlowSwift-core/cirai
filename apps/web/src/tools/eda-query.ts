import { getEDA } from '@cirai/adapter'

export interface EDAQueryResult {
  user: {
    username?: string
    nickname?: string
    avatar?: string
    uuid?: string
    customerCode?: string
  } | null
  project: {
    id?: string
    name?: string
    path?: string
    type?: string
  } | null
  document: {
    id?: string
    name?: string
    type?: string
    filePath?: string
    isModified?: boolean
  } | null
  board: {
    id?: string
    name?: string
    width?: number
    height?: number
    layers?: number
  } | null
  pcb: {
    id?: string
    name?: string
    primitives?: unknown[]
  } | null
  schematic: {
    id?: string
    name?: string
    primitives?: unknown[]
  } | null
  selection: {
    pcb?: unknown[]
    schematic?: unknown[]
    count?: number
  } | null
  team: {
    id?: string
    name?: string
    role?: string
  } | null
  workspace: {
    id?: string
    name?: string
    type?: string
  } | null
  editor: {
    version?: string
    compileDate?: string
  } | null
}

interface DmtProject {
  getCurrentProjectInfo: () => Promise<{
    id?: string
    name?: string
    path?: string
    type?: string
  }>
}

interface DmtSelectControl {
  getCurrentDocumentInfo: () => Promise<{
    id?: string
    name?: string
    type?: string
    filePath?: string
    isModified?: boolean
  }>
}

interface DmtBoard {
  getCurrentBoardInfo: () => Promise<{
    id?: string
    name?: string
    width?: number
    height?: number
    layers?: number
  }>
}

interface DmtPcb {
  getCurrentPcbInfo: () => Promise<{
    id?: string
    name?: string
    primitives?: unknown[]
  }>
}

interface DmtSchematic {
  getCurrentSchematicInfo: () => Promise<{
    id?: string
    name?: string
    primitives?: unknown[]
  }>
}

interface DmtTeam {
  getCurrentTeamInfo: () => Promise<{
    id?: string
    name?: string
    role?: string
  }>
}

interface DmtWorkspace {
  getCurrentWorkspaceInfo: () => Promise<{
    id?: string
    name?: string
    type?: string
  }>
}

interface PcbSelectControl {
  getSelectedPrimitives: () => Promise<unknown[]>
}

interface SchSelectControl {
  getSelectedPrimitives: () => Promise<unknown[]>
}

interface ExtendedEDA {
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
  dmt_Project?: DmtProject
  dmt_SelectControl?: DmtSelectControl
  dmt_Board?: DmtBoard
  dmt_Pcb?: DmtPcb
  dmt_Schematic?: DmtSchematic
  dmt_Team?: DmtTeam
  dmt_Workspace?: DmtWorkspace
  pcb_SelectControl?: PcbSelectControl
  sch_SelectControl?: SchSelectControl
}

export async function edaQuery(): Promise<EDAQueryResult> {
  const eda = getEDA() as unknown as ExtendedEDA

  const result: EDAQueryResult = {
    user: null,
    project: null,
    document: null,
    board: null,
    pcb: null,
    schematic: null,
    selection: null,
    team: null,
    workspace: null,
    editor: null,
  }

  try {
    result.user = eda.sys_Environment.getUserInfo()
  } catch {
    result.user = null
  }

  try {
    result.editor = {
      version: eda.sys_Environment.getEditorCurrentVersion(),
      compileDate: eda.sys_Environment.getEditorCompliedDate(),
    }
  } catch {
    result.editor = null
  }

  try {
    const projInfo = await eda.dmt_Project?.getCurrentProjectInfo?.()
    if (projInfo) {
      result.project = {
        id: projInfo.id,
        name: projInfo.name,
        path: projInfo.path,
        type: projInfo.type,
      }
    }
  } catch {
    result.project = null
  }

  try {
    const docInfo = await eda.dmt_SelectControl?.getCurrentDocumentInfo?.()
    if (docInfo) {
      result.document = {
        id: docInfo.id,
        name: docInfo.name,
        type: docInfo.type,
        filePath: docInfo.filePath,
        isModified: docInfo.isModified,
      }
    }
  } catch {
    result.document = null
  }

  try {
    const boardInfo = await eda.dmt_Board?.getCurrentBoardInfo?.()
    if (boardInfo) {
      result.board = {
        id: boardInfo.id,
        name: boardInfo.name,
        width: boardInfo.width,
        height: boardInfo.height,
        layers: boardInfo.layers,
      }
    }
  } catch {
    result.board = null
  }

  try {
    const pcbInfo = await eda.dmt_Pcb?.getCurrentPcbInfo?.()
    if (pcbInfo) {
      result.pcb = {
        id: pcbInfo.id,
        name: pcbInfo.name,
        primitives: pcbInfo.primitives,
      }
    }
  } catch {
    result.pcb = null
  }

  try {
    const schInfo = await eda.dmt_Schematic?.getCurrentSchematicInfo?.()
    if (schInfo) {
      result.schematic = {
        id: schInfo.id,
        name: schInfo.name,
        primitives: schInfo.primitives,
      }
    }
  } catch {
    result.schematic = null
  }

  try {
    const pcbSelection = await eda.pcb_SelectControl?.getSelectedPrimitives?.()
    const schSelection = await eda.sch_SelectControl?.getSelectedPrimitives?.()
    result.selection = {
      pcb: pcbSelection ? [pcbSelection] : undefined,
      schematic: schSelection ? [schSelection] : undefined,
      count: (pcbSelection ? 1 : 0) + (schSelection ? 1 : 0),
    }
  } catch {
    result.selection = null
  }

  try {
    const teamInfo = await eda.dmt_Team?.getCurrentTeamInfo?.()
    if (teamInfo) {
      result.team = {
        id: teamInfo.id,
        name: teamInfo.name,
        role: teamInfo.role,
      }
    }
  } catch {
    result.team = null
  }

  try {
    const wsInfo = await eda.dmt_Workspace?.getCurrentWorkspaceInfo?.()
    if (wsInfo) {
      result.workspace = {
        id: wsInfo.id,
        name: wsInfo.name,
        type: wsInfo.type,
      }
    }
  } catch {
    result.workspace = null
  }

  return result
}
