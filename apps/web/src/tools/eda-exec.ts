import { getEDA } from '@cirai/adapter'
import { edaQuery, type EDAStatusResult } from './eda-query'

export interface EDAExecInput {
  code: string
  timeout?: number
}

export interface EDAExecResult {
  success: boolean
  result?: unknown
  error?: string
  /** 执行后的环境状态 */
  _status?: EDAStatusResult
}

const MAX_OUTPUT_LENGTH = 2000
const TRUNCATED_MARKER = '\n... [truncated]'

/**
 * 截断过大的输出结果，节省 LLM context
 */
function truncateResult(result: unknown): unknown {
  const str = JSON.stringify(result)

  if (str.length <= MAX_OUTPUT_LENGTH) {
    return result
  }

  // 如果是数组，保留前 N 个元素
  if (Array.isArray(result)) {
    let currentLength = 2 // "[]"
    const truncated: unknown[] = []

    for (const item of result) {
      const itemStr = JSON.stringify(item)
      if (currentLength + itemStr.length + 2 > MAX_OUTPUT_LENGTH - TRUNCATED_MARKER.length) {
        break
      }
      truncated.push(item)
      currentLength += itemStr.length + 2
    }

    return {
      _truncated: true,
      total: result.length,
      shown: truncated.length,
      items: truncated,
    }
  }

  // 如果是对象，进行字符串截断
  if (typeof result === 'object' && result !== null) {
    // 尝试保留关键字段，截断长字段
    const truncated: Record<string, unknown> = {}
    let currentLength = 2 // "{}"

    for (const [key, value] of Object.entries(result)) {
      const valueStr = JSON.stringify(value)

      if (currentLength + key.length + valueStr.length + 4 > MAX_OUTPUT_LENGTH - TRUNCATED_MARKER.length) {
        // 如果空间不够，标记截断
        truncated[key] = `[truncated: ${valueStr.length} chars]`
        break
      }

      truncated[key] = value
      currentLength += key.length + valueStr.length + 4
    }

    return {
      _truncated: true,
      ...truncated,
    }
  }

  // 基本类型的长字符串直接截断
  if (typeof result === 'string') {
    return result.slice(0, MAX_OUTPUT_LENGTH - TRUNCATED_MARKER.length) + TRUNCATED_MARKER
  }

  return result
}

export async function edaExec(input: EDAExecInput): Promise<EDAExecResult> {
  const { code, timeout = 30000 } = input
  const eda = getEDA()

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    const fn = new AsyncFunction('eda', code)

    const execPromise = fn(eda)

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeout}ms`))
      }, timeout)
    })

    const result = await Promise.race([execPromise, timeoutPromise])

    if (result === undefined) {
      return {
        success: false,
        error: 'Code returned no value. Please ensure your code returns a result using `return` or explicit value.',
        _status: await edaQuery(),
      }
    }

    // 截断大结果
    const truncatedResult = truncateResult(result)

    return {
      success: true,
      result: truncatedResult,
      _status: await edaQuery(),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      _status: await edaQuery(),
    }
  }
}
