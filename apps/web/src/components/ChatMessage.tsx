import { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
  isStreaming: boolean
  isLast: boolean
}

export function ChatMessage({ message, isStreaming, isLast }: ChatMessageProps) {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 text-content-primary'
            : 'bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/50 text-content-secondary'
        }`}
      >
        {message.parts
          .filter(part => part.type === 'text')
          .map((part, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed">
              {part.text}
            </div>
          ))}
        {message.role === 'assistant' && isStreaming && isLast && (
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
  )
}