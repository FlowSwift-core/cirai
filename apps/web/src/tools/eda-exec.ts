import { getEDA } from '@cirai/adapter'

export interface EDAExecInput {
  code: string
  timeout?: number
}

export interface EDAExecResult {
  success: boolean
  result?: unknown
  error?: string
  logs?: string[]
}

export async function edaExec(input: EDAExecInput): Promise<EDAExecResult> {
  const { code, timeout = 30000 } = input
  const eda = getEDA()
  const logs: string[] = []

  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error

  const captureLog = (...args: unknown[]) => {
    logs.push(args.map(a => String(a)).join(' '))
  }

  console.log = captureLog
  console.warn = captureLog
  console.error = captureLog

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

    return {
      success: true,
      result,
      logs: logs.length > 0 ? logs : undefined,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      logs: logs.length > 0 ? logs : undefined,
    }
  } finally {
    console.log = originalLog
    console.warn = originalWarn
    console.error = originalError
  }
}
