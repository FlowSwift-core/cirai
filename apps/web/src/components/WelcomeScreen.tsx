interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void
}

const PROMPTS = [
  'Help me design a power supply',
  'Review my PCB layout',
  'Suggest components for...',
  'Explain this schematic'
]

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  return (
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
        {PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(prompt)}
            className="px-4 py-2 rounded-lg bg-surface-tertiary border border-border-subtle text-sm text-content-secondary hover:text-content-primary hover:border-border-active transition-all duration-200 hover:scale-[1.02]"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}