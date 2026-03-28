import { useState } from 'react'
import type { ToolCall } from './types'

interface ToolCallItemProps {
  call: ToolCall
  isLatest: boolean
}

export function ToolCallItem({ call, isLatest }: ToolCallItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const duration = call.endTime ? call.endTime - call.startTime : Date.now() - call.startTime

  return (
    <div className={`p-3 ${isLatest ? 'bg-[#18181b]/50' : ''}`}>
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3 h-3 text-[#71717a] transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className={`w-1.5 h-1.5 rounded-full ${
            call.status === 'pending' ? 'bg-amber-400 animate-pulse' :
            call.status === 'success' ? 'bg-emerald-400' :
            'bg-red-400'
          }`} />
          <span className="text-xs font-mono text-[#e4e4e7]">{call.name}</span>
        </div>
        <span className="text-[10px] font-mono text-[#71717a]">
          {duration}ms
        </span>
      </div>

      <div className={`space-y-2 mt-2 transition-all duration-200 overflow-hidden ${isCollapsed ? 'max-h-0 mt-0' : 'max-h-[2000px]'}`}>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-wider">Input</span>
          </div>
          <pre className="text-[10px] font-mono text-[#a1a1aa] bg-[#09090b] rounded p-2 overflow-x-auto border border-[#27272a]">
            {JSON.stringify(call.input, null, 2)}
          </pre>
        </div>

        {call.output !== undefined && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-wider">Output</span>
              {call.status === 'error' && (
                <span className="text-[9px] font-mono text-red-400">Error</span>
              )}
            </div>
            <pre className={`text-[10px] font-mono bg-[#09090b] rounded p-2 overflow-x-auto border ${
              call.status === 'error' ? 'border-red-900/50 text-red-300' : 'border-[#27272a] text-[#a1a1aa]'
            }`}>
              {JSON.stringify(call.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
