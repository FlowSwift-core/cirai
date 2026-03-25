interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  isFocused: boolean
  disabled: boolean
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onKeyDown,
  onFocus,
  onBlur,
  isFocused,
  disabled,
}: ChatInputProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}
    >
      <div className={`relative rounded-xl bg-surface-tertiary border transition-all duration-300 overflow-hidden ${isFocused ? 'border-accent-primary/50 shadow-lg shadow-cyan-500/10' : 'border-border-subtle'}`}>
        <textarea
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Ask anything about your EasyEDA project..."
          className="w-full bg-transparent px-4 py-3 pr-24 text-content-primary placeholder-content-muted resize-none focus:outline-none text-sm leading-relaxed"
          rows={1}
          disabled={disabled}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-xs text-content-muted font-mono mr-2 hidden sm:inline">
            ⌘↵
          </span>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="p-2 rounded-lg bg-accent-primary hover:bg-accent-secondary disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {disabled ? (
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
  )
}