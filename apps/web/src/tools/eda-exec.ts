import { getEDA } from '@cirai/adapter'

export interface EDAExecInput {
  code: string
  timeout?: number
}

export interface EDAExecResult {
  success: boolean
  result?: unknown
  error?: string
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
      }
    }

    return {
      success: true,
      result,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}