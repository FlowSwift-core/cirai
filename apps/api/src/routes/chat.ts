import { Hono } from 'hono'
import { streamText, convertToModelMessages } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const chatRouter = new Hono()

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
  const result = streamText({
    model: client('openai/gpt-oss-120b'),
    system: 'You are Cirai, an AI assistant for EasyEDA Pro. Help users with component selection, PCB design tips, and general electronics questions.',
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
})

export { chatRouter }
