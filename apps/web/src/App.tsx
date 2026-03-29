import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { getEDA } from '@cirai/adapter'
import { edaExec } from './tools/eda-exec'
import { edaQuery } from './tools/eda-query'
import { Header, WelcomeScreen, ChatList, ChatInput, ErrorDisplay, ToolCallPanel, ToolCall } from './components'

const API_URL = 'http://localhost:3001/api/chat'

const eda = getEDA()

function App() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [panelExpanded, setPanelExpanded] = useState(true)
  const [panelView, setPanelView] = useState<'tools' | 'topics'>('tools')
  const [userInfo] = useState(() => eda.sys_Environment.getUserInfo())

  const { messages, sendMessage, status, error, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: API_URL,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) {
        return
      }
      
      const toolCallId = `tool_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      
      // only for selected tools, you can choose to handle all tools or set up a whitelist
      const supportedTools = ['eda_query', 'eda_exec']
      if (!supportedTools.includes(toolCall.toolName)) {
        return
      }

      setToolCalls(prev => [...prev, {
        id: toolCallId,
        name: toolCall.toolName,
        input: toolCall.input,
        status: 'pending',
        startTime: Date.now(),
      }])
      
      try {
        if (toolCall.toolName === 'eda_query') {
          const result = await edaQuery()
          addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: result,
          })
          setToolCalls(prev => prev.map(tc =>
            tc.id === toolCallId
              ? { ...tc, output: result, status: 'success', endTime: Date.now() }
              : tc
          ))
        } else if (toolCall.toolName === 'eda_exec') {
          const result = await edaExec(toolCall.input as { code: string; timeout?: number })
          addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output: result,
          })
          setToolCalls(prev => prev.map(tc =>
            tc.id === toolCallId
              ? { ...tc, output: result, status: result.success ? 'success' : 'error', endTime: Date.now() }
              : tc
          ))
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setToolCalls(prev => prev.map(tc => 
          tc.id === toolCallId 
            ? { ...tc, output: { error: errorMessage }, status: 'error', endTime: Date.now() }
            : tc
        ))
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

  const handleSwitchView = (view: 'tools' | 'topics') => {
    setPanelView(view)
    if (!panelExpanded) {
      setPanelExpanded(true)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      
      <Header userInfo={userInfo} status={status} />

      <main className={`relative z-10 flex-1 overflow-y-auto transition-all duration-300 ${panelExpanded ? 'pr-96' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <WelcomeScreen onSelectPrompt={setInput} />
          )}

          <ErrorDisplay error={error} />

          <ChatList messages={messages} isStreaming={status === 'streaming'} toolCalls={toolCalls} />
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className={`relative z-10 border-t border-border-subtle bg-surface-secondary/80 backdrop-blur-md transition-all duration-300 ${panelExpanded ? 'pr-96' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            isFocused={isFocused}
            disabled={status === 'streaming'}
          />
          
          <p className="text-center text-xs text-content-muted mt-3 font-mono">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </footer>

      <ToolCallPanel
        toolCalls={toolCalls}
        isExpanded={panelExpanded}
        onToggle={() => setPanelExpanded(!panelExpanded)}
        activeView={panelView}
        onSwitchView={handleSwitchView}
      />
    </div>
  )
}

export default App