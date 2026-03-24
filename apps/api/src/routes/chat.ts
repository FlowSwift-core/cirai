import { Hono } from 'hono'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

const chatRouter = new Hono()

chatRouter.post('/chat', async c => {
  const { messages } = await c.req.json()

  const apiKey = process.env.NVIDIA_API_KEY
  const baseURL = 'https://integrate.api.nvidia.com/v1'

  if (!apiKey) {
    return c.json({ error: 'NVIDIA_API_KEY not configured' }, 500)
  }

  const client = openai({
    apiKey,
    baseURL,
  })

  const result = streamText({
    model: client('openai/gpt-oss-120b'),
    system: 'You are Cirai, an AI assistant for EasyEDA Pro. Help users with component selection, PCB design tips, and general electronics questions.',
    messages,
  })

  return result.toUIMessageStreamResponse()
})

export { chatRouter }
