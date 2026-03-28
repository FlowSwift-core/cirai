export interface ToolCall {
  id: string
  name: string
  input: unknown
  output?: unknown
  status: 'pending' | 'success' | 'error'
  startTime: number
  endTime?: number
}
