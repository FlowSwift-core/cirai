import { Hono } from 'hono'
import { streamText, convertToModelMessages, stepCountIs, tool } from 'ai'
import { z } from 'zod'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { getBashTool } from '../tools/bash-tool'
import { resolve} from 'node:path';
import { readFileSync } from 'node:fs';

const chatRouter = new Hono()

const bashToolPromise = getBashTool()

const edaQueryTool = tool({
  description: 'Query detailed EasyEDA environment status including project info, document info, selection details, errors and warnings. Use this to get current environment state before executing code.',
  inputSchema: z.object({}),
})

const edaExecTool = tool({
  description: 'Execute JavaScript code in EasyEDA runtime and get results. The code MUST use `return` statement, console.log/warn/error/info outputs are also captured. The result automatically includes simplified `_status` field showing project name, document name/type, and selection count. For detailed status, use eda_query tool first. Large outputs are truncated. IMPORTANT: Before writing code to call EDA APIs, use bash tool to query documentation first.',
  inputSchema: z.object({
    code: z.string().describe('JavaScript code to execute. The `eda` object is available. MUST include the return statement.'),
    timeout: z.number().optional().describe('Timeout in milliseconds (default 30000)'),
  }),
})

const __project = resolve() // get current directory

const promptTemplate = readFileSync(resolve(__project, './src/prompt.txt'), 'utf-8')

chatRouter.post('/chat', async c => {
  const { messages } = await c.req.json()

  const apiKey = process.env.NVIDIA_API_KEY
  const baseURL = 'https://integrate.api.nvidia.com/v1'

  if (!apiKey) {
    return c.json({ error: 'NVIDIA_API_KEY not configured' }, 500)
  }

  const client = createOpenAICompatible({
    name: 'nim',
    apiKey,
    baseURL,
  })

  const today = new Date().toUTCString().slice(0, 16) // e.g. "Sat, 01 Jul 2023"

  console.log('Received messages', messages.length);
  const modelMessages = await convertToModelMessages(messages)
  const { bash } = await bashToolPromise
  const result = streamText({
    model: client('openai/gpt-oss-120b'),
    system: promptTemplate.replace('${today}', today),
    messages: modelMessages,
    tools: { bash, eda_query: edaQueryTool, eda_exec: edaExecTool },
    stopWhen: stepCountIs(20),
    onStepFinish: (step) => {
      if (step.toolCalls.length > 0) {
        console.log('Tool calls in this step:', step.toolCalls)
      }
      if (step.toolResults.length > 0) {
        console.log('Tool results in this step:', step.toolResults)
      }
    }
  })

  return result.toUIMessageStreamResponse()
})

export { chatRouter }
