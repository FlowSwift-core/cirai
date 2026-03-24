import { Hono } from 'hono'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { getBashTool } from '../tools/bash-tool'

const chatRouter = new Hono()

const bashToolPromise = getBashTool()

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

  console.log('Received messages', messages.length);
  const modelMessages = await convertToModelMessages(messages)
  const { bash } = await bashToolPromise
  const result = streamText({
    model: client('openai/gpt-oss-120b'),
    system: `You are Cirai, an AI assistant for EasyEDA Pro. You have access to EasyEDA API documentation in an in-memory filesystem at:
- guide/ - Getting started guides
- references/ - API reference documentation

Use the bash tool to search and read docs:
- grep -r "keyword" guide/ references/
- cat guide/how-to-start.md
- ls references/

Do NOT use destructive commands (rm, mv, etc).`,
    messages: modelMessages,
    tools: { bash },
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
