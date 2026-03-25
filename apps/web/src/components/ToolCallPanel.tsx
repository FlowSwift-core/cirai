import { useState } from 'react'

export interface ToolCall {
  id: string
  name: string
  input: unknown
  output?: unknown
  status: 'pending' | 'success' | 'error'
  startTime: number
  endTime?: number
}

interface ToolCallPanelProps {
  toolCalls: ToolCall[]
  isExpanded: boolean
  onToggle: () => void
}

export function ToolCallPanel({ toolCalls, isExpanded, onToggle }: ToolCallPanelProps) {
  return (
    <div 
      className={`fixed right-0 top-[5rem] bottom-0 w-96 bg-[#0a0a0b] border-l border-[#27272a] flex flex-col z-50 transition-transform duration-300 ${
        isExpanded ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={onToggle}
        className={`absolute -left-10 top-4 px-3 py-2 bg-[#18181b] border border-r-0 border-[#27272a] rounded-l-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-all ${
          !isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />
          <span className="text-sm font-medium text-[#fafafa] tracking-tight">Tool Debug</span>
          {toolCalls.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#27272a] text-[#a1a1aa] rounded">
              {toolCalls.length}
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-[#71717a] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {toolCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-[#71717a] font-mono">No tool calls yet</p>
            <p className="text-[10px] text-[#52525b] mt-1">Tool invocations will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-[#27272a]">
            {[...toolCalls].reverse().map((call, idx) => (
              <ToolCallItem key={call.id} call={call} isLatest={idx === 0} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[#27272a] text-[10px] text-[#52525b] font-mono">
        {isExpanded ? 'Click X to collapse' : 'Click gear to expand'}
      </div>
    </div>
  )
}

interface ToolCallItemProps {
  call: ToolCall
  isLatest: boolean
}

function ToolCallItem({ call, isLatest }: ToolCallItemProps) {
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