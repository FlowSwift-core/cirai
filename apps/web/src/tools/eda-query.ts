import { getEDA } from '@cirai/adapter'

export interface EDAStatusResult {
  /** 当前项目名 */
  project?: string
  /** 当前文档名和类型 */
  document?: {
    name: string
    type: 'schematic' | 'pcb' | string
    modified?: boolean
  }
  /** 选中对象数量 */
  selectionCount: number
  /** 是否有错误 */
  hasError: boolean
  /** 警告数量 */
  warningCount: number
}

interface ExtendedEDA {
  sys_Environment: {
    getUserInfo: () => {
      username?: string
      nickname?: string
    }
  }
  dmt_Project?: {
    getCurrentProjectInfo: () => Promise<{
      name?: string
    }>
  }
  dmt_SelectControl?: {
    getCurrentDocumentInfo: () => Promise<{
      name?: string
      type?: string
      isModified?: boolean
    }>
  }
  pcb_SelectControl?: {
    getSelectedPrimitives: () => Promise<unknown[]>
  }
  sch_SelectControl?: {
    getSelectedPrimitives: () => Promise<unknown[]>
  }
  // 可能有错误或警告相关API
  sys_DesignRuleCheck?: {
    getErrorCount: () => number
    getWarningCount: () => number
  }
}

/**
 * 获取 EasyEDA 状态栏级别的环境信息
 * 简洁、快速，用于附带在 exec 结果中
 */
export async function edaQuery(): Promise<EDAStatusResult> {
  const eda = getEDA() as unknown as ExtendedEDA

  const result: EDAStatusResult = {
    selectionCount: 0,
    hasError: false,
    warningCount: 0,
  }

  try {
    const projInfo = await eda.dmt_Project?.getCurrentProjectInfo?.()
    if (projInfo?.name) {
      result.project = projInfo.name
    }
  } catch {
    // ignore
  }

  try {
    const docInfo = await eda.dmt_SelectControl?.getCurrentDocumentInfo?.()
    if (docInfo) {
      result.document = {
        name: docInfo.name || 'Untitled',
        type: docInfo.type || 'unknown',
        modified: docInfo.isModified,
      }
    }
  } catch {
    // ignore
  }

  try {
    const pcbSelection = await eda.pcb_SelectControl?.getSelectedPrimitives?.()
    const schSelection = await eda.sch_SelectControl?.getSelectedPrimitives?.()
    result.selectionCount = (pcbSelection?.length || 0) + (schSelection?.length || 0)
  } catch {
    // ignore
  }

  // 尝试获取错误/警告信息（如果API存在）
  try {
    if (eda.sys_DesignRuleCheck) {
      result.hasError = eda.sys_DesignRuleCheck.getErrorCount?.() > 0
      result.warningCount = eda.sys_DesignRuleCheck.getWarningCount?.() || 0
    }
  } catch {
    // ignore
  }

  return result
}
