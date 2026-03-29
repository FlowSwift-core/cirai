import { getEDA } from '@cirai/adapter'
import { edaQuery, type EDAQueryResult } from './eda-query'

export interface EDAExecInput {
  code: string
  timeout?: number
}

export interface EDAExecResult {
  success: boolean
  result?: unknown
  logs?: string[]
  error?: string
  /** 执行后的环境状态 */
  _status?: EDAQueryResult
}

const MAX_OUTPUT_LENGTH = 8000
const TRUNCATED_MARKER = '\n... [truncated]'

function truncateResult(result: unknown): unknown {
  const str = JSON.stringify(result)

  if (str.length <= MAX_OUTPUT_LENGTH) {
    return result
  }

  const truncated = str.slice(0, MAX_OUTPUT_LENGTH - TRUNCATED_MARKER.length) + TRUNCATED_MARKER

  try {
    return JSON.parse(truncated)
  } catch {
    return truncated
  }
}

function createConsoleInterceptor() {
  const logs: string[] = []
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  }

  const methods: (keyof typeof originalConsole)[] = ['log', 'warn', 'error', 'info']

  for (const method of methods) {
    console[method] = (...args: unknown[]) => {
      const msg = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' ')
      logs.push(`[${method.toUpperCase()}] ${msg}`)
    }
  }

  return {
    logs,
    restore: () => {
      for (const method of methods) {
        console[method] = originalConsole[method]
      }
    },
  }
}

export async function edaExec(input: EDAExecInput): Promise<EDAExecResult> {
  const { code, timeout = 30000 } = input
  const eda = getEDA()
  const { logs, restore } = createConsoleInterceptor()

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
        logs: logs.length > 0 ? logs : undefined,
        _status: await edaQuery(),
      }
    }

    const truncatedResult = truncateResult(result)

    return {
      success: true,
      result: truncatedResult,
      logs: logs.length > 0 ? logs : undefined,
      _status: await edaQuery(),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      logs: logs.length > 0 ? logs : undefined,
      _status: await edaQuery(),
    }
  } finally {
    restore()
  }
}
