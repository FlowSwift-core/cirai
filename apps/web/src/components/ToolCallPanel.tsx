import type { ToolCall } from './types'
import { ToolCallItem } from './ToolCallItem'

interface ToolCallPanelProps {
  toolCalls: ToolCall[]
  isExpanded: boolean
  onToggle: () => void
  activeView: 'tools' | 'topics'
  onSwitchView: (view: 'tools' | 'topics') => void
}

export function ToolCallPanel({ toolCalls, isExpanded, onToggle, activeView, onSwitchView }: ToolCallPanelProps) {
  return (
    <div
      className={`fixed right-0 top-[5rem] bottom-0 w-96 bg-[#0a0a0b] border-l border-[#27272a] flex flex-col z-50 transition-transform duration-300 ${
        isExpanded ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="absolute -left-10 top-4 flex flex-col gap-1">
        <button
          onClick={() => onSwitchView('tools')}
          className={`px-3 py-2 bg-[#18181b] border border-r-0 border-[#27272a] rounded-l-lg transition-all ${
            activeView === 'tools'
              ? 'text-[#22d3ee] bg-[#27272a]'
              : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
          }`}
          title="Tool Calls"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={() => onSwitchView('topics')}
          className={`px-3 py-2 bg-[#18181b] border border-r-0 border-[#27272a] rounded-l-lg transition-all ${
            activeView === 'topics'
              ? 'text-[#22d3ee] bg-[#27272a]'
              : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
          }`}
          title="Topics"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeView === 'tools' ? 'bg-[#22d3ee]' : 'bg-[#a855f7]'}`} />
          <span className="text-sm font-medium text-[#fafafa] tracking-tight">
            {activeView === 'tools' ? 'Tool Debug' : 'Topics'}
          </span>
          {activeView === 'tools' && toolCalls.length > 0 && (
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
        {activeView === 'tools' ? (
          toolCalls.length === 0 ? (
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
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xs text-[#71717a] font-mono">Topics</p>
            <p className="text-[10px] text-[#52525b] mt-1">Multiple chat sessions coming soon</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[#27272a] text-[10px] text-[#52525b] font-mono">
        {isExpanded ? 'Click X to collapse' : 'Click icons to expand'}
      </div>
    </div>
  )
}
