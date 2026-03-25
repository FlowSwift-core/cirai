import { UIMessage } from 'ai'
import { ChatMessage } from './ChatMessage'

interface ChatListProps {
  messages: UIMessage[]
  isStreaming: boolean
}

export function ChatList({ messages, isStreaming }: ChatListProps) {
  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          isStreaming={isStreaming}
          isLast={idx === messages.length - 1}
        />
      ))}
    </div>
  )
}