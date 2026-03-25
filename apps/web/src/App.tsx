import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { getEDA } from '@cirai/adapter'
import { edaQuery } from './tools/eda-query'
import { edaExec } from './tools/eda-exec'

const API_URL = 'http://localhost:3001/api/chat'

const eda = getEDA()

function App() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [userInfo] = useState(() => eda.sys_Environment.getUserInfo())

  const { messages, sendMessage, status, error, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: API_URL,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === 'eda_query') {
        const result = await edaQuery()
        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: result,
        })
      } else if (toolCall.toolName === 'eda_exec') {
        const args = toolCall as unknown as { args: { code: string; timeout?: number } }
        const result = await edaExec(args.args)
        addToolOutput({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: result,
        })
      }
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === 'streaming') return
    sendMessage({ text: input.trim() })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      
      <header className="relative z-10 border-b border-border-subtle bg-surface-secondary/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-content-primary tracking-tight">Cirai</h1>
              <p className="text-xs text-content-muted font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                EasyEDA Pro AI Helper
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {userInfo.username && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-tertiary border border-border-subtle">
                <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs font-medium text-accent-primary">
                  {userInfo.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-content-secondary">{userInfo.username}</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-md bg-surface-tertiary border border-border-subtle text-xs font-mono text-content-muted">
              {status === 'streaming' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                  Processing
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/5 border border-accent-primary/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-content-primary mb-2 tracking-tight">
                Welcome to <span className="text-gradient">Cirai</span>
              </h2>
              <p className="text-content-muted max-w-md mb-8">
                Your intelligent assistant for EasyEDA projects. Ask me about schematics, PCB layouts, or component selection.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {[
                  'Help me design a power supply',
                  'Review my PCB layout',
                  'Suggest components for...',
                  'Explain this schematic'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 rounded-lg bg-surface-tertiary border border-border-subtle text-sm text-content-secondary hover:text-content-primary hover:border-border-active transition-all duration-200 hover:scale-[1.02]"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm animate-fade-in">
              <span className="font-semibold">Error:</span> {error.message}
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 text-content-primary'
                      : 'bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/50 text-content-secondary'
                  }`}
                >
                  {msg.parts
                    .filter(part => part.type === 'text')
                    .map((part, i) => (
                      <div key={i} className="whitespace-pre-wrap leading-relaxed">
                        {part.text}
                      </div>
                    ))}
                  {msg.role === 'assistant' && status === 'streaming' && idx === messages.length - 1 && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-zinc-800/50">
                      <div className="typing-indicator flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border-subtle bg-surface-secondary/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form 
            onSubmit={handleSubmit} 
            className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}
          >
            <div className={`relative rounded-xl bg-surface-tertiary border transition-all duration-300 overflow-hidden ${isFocused ? 'border-accent-primary/50 shadow-lg shadow-cyan-500/10' : 'border-border-subtle'}`}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask anything about your EasyEDA project..."
                className="w-full bg-transparent px-4 py-3 pr-24 text-content-primary placeholder-content-muted resize-none focus:outline-none text-sm leading-relaxed"
                rows={1}
                disabled={status === 'streaming'}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-xs text-content-muted font-mono mr-2 hidden sm:inline">
                  ⌘↵
                </span>
                <button
                  type="submit"
                  disabled={status === 'streaming' || !input.trim()}
                  className="p-2 rounded-lg bg-accent-primary hover:bg-accent-secondary disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                >
                  {status === 'streaming' ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          <p className="text-center text-xs text-content-muted mt-3 font-mono">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
