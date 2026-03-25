interface ErrorDisplayProps {
  error: Error | null | undefined
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null
  
  return (
    <div className="mb-4 p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm animate-fade-in">
      <span className="font-semibold">Error:</span> {error.message}
    </div>
  )
}