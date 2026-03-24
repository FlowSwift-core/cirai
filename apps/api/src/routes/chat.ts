import { Hono } from 'hono'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

const chatRouter = new Hono()

chatRouter.post('/chat', async c => {
  const { messages } = await c.req.json<{
    messages: Array<{ role: string; content: string }>
  }>()

  const apiKey = process.env.OPENAI_API_KEY
  const baseURL = process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1'

  if (!apiKey) {
    return c.json({ error: 'OPENAI_API_KEY not configured' }, 500)
  }

  const client = openai({
    apiKey,
    baseURL,
  })

  const result = streamText({
    model: client('nvidia/llama-3.1-nemotron-70b-instruct'),
    messages: messages as any,
  })

  return result.toDataStreamResponse()
})

export { chatRouter }
