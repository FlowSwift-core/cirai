import { useMemo } from 'react'
import { UIMessage } from 'ai'
import { ChatMessage } from './ChatMessage'

interface ChatListProps {
  messages: UIMessage[]
  isStreaming: boolean
  toolCalls?: { name: string; status: 'pending' | 'success' | 'error'; input?: unknown }[]
}

const THINKING_MESSAGES = [
  'Analyzing your request',
  'Processing',
  'Thinking',
  'Working on it',
]

const TOOL_MESSAGES: Record<string, string[]> = {
  bash: [
    'Running bash command',
    'Executing script',
    'Processing command',
    'Applying changes',
  ],
  eda_query: [
    'Querying EDA environment',
    'Fetching project data',
    'Reading schematic state',
    'Gathering context',
  ],
  eda_exec: [
    'Executing script',
    'Running code',
    'Processing command',
    'Applying changes',
  ],
}

function getRandomMessage(messages: string[], seed: number): string {
  const index = seed % messages.length
  return messages[index]
}

export function ChatList({ messages, isStreaming, toolCalls }: ChatListProps) {
  const pendingTools = toolCalls?.filter(tc => tc.status === 'pending');
  const pendingTool = pendingTools && pendingTools.length > 0 ? pendingTools[pendingTools.length - 1] : undefined

  const statusMessage = useMemo(() => {
    if (pendingTool) {
      const toolMessages = TOOL_MESSAGES[pendingTool.name] || THINKING_MESSAGES
      const seed = JSON.stringify(pendingTool.input).length
      return getRandomMessage(toolMessages, seed)
    } else if (isStreaming) {
      return getRandomMessage(THINKING_MESSAGES, messages.length)
    }
    return ''
  }, [pendingTool?.name, pendingTool?.input, isStreaming, messages.length])

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          isStreaming={isStreaming}
          isLast={idx === messages.length - 1}
          toolStatus={idx === messages.length - 1 && isStreaming ? statusMessage : undefined}
        />
      ))}
    </div>
  )
}