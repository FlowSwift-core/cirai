interface HeaderProps {
  userInfo: { username?: string; email?: string }
  status: 'submitted' | 'streaming' | 'ready' | 'error'
}

export function Header({ userInfo, status }: HeaderProps) {
  return (
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
  )
}