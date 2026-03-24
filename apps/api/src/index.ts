import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { chatRouter } from './routes/chat'

const app = new Hono()

app.use('*', cors())

app.get('/', c => c.json({ status: 'ok', name: 'Cirai API' }))

app.route('/api', chatRouter)

const port = parseInt(process.env.PORT || '3001')

console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
