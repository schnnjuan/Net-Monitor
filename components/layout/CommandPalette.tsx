'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Globe, AlertTriangle, Zap } from 'lucide-react'
import countriesData from '@/data/countries.json'
import { useLanguage } from '@/lib/LanguageContext'

interface SearchResult {
  type: 'country' | 'event'
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
}

export default function CommandPalette({ events }: { events: any[] }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
    }
  }, [isOpen])

  // Filtering Logic
  const results: SearchResult[] = []

  // 1. Countries
  if (query.length > 0) {
    const matchedCountries = countriesData
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(c => ({
        type: 'country' as const,
        id: c.code,
        title: c.name,
        subtitle: `Country // ${c.code}`,
        icon: <Globe className="w-4 h-4 text-normal" />
      }))
    results.push(...matchedCountries)

    // 2. Active Events
    const matchedEvents = events
      .filter(e => e.countryName.toLowerCase().includes(query.toLowerCase()) || e.category.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(e => ({
        type: 'event' as const,
        id: e.countryCode,
        title: e.title,
        subtitle: `${e.category.toUpperCase()} // Active Event`,
        icon: <AlertTriangle className={`w-4 h-4 ${e.category === 'shutdown' ? 'text-shutdown' : 'text-censorship'}`} />
      }))
    results.push(...matchedEvents)
  }

  const handleSelect = (result: SearchResult) => {
    router.push(`/country/${result.id}`)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 1, 0))
    if (e.key === 'Enter' && results[selectedIndex]) handleSelect(results[selectedIndex])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl bg-bg-overlay border border-border-strong rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm text-white border-none outline-none placeholder:text-muted font-mono font-bold"
            placeholder={t.search_placeholder}
            value={query}
            onChange={(e) => {
               setQuery(e.target.value)
               setSelectedIndex(0)
            }}
          />
          <div className="px-1.5 py-0.5 border border-border rounded text-[9px] text-white/60 font-black">ESC</div>
        </div>

        {/* Results List */}
        <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
          {results.length > 0 ? (
            results.map((result, idx) => (
              <button
                key={`${result.type}-${result.id}-${idx}`}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all text-left group ${idx === selectedIndex ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'}`}
                onClick={() => handleSelect(result)}
              >
                <div className="p-2 rounded bg-black/40 border border-white/5 group-hover:border-white/20 shadow-sm">
                   {result.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-white uppercase tracking-tight">{result.title}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">{result.subtitle}</div>
                </div>
                {idx === selectedIndex && <Zap className="w-3.5 h-3.5 text-normal animate-pulse shadow-[0_0_10px_var(--normal)]" />}
              </button>
            ))
          ) : query.length > 0 ? (
            <div className="py-12 text-center text-white/40 text-xs uppercase tracking-[0.2em] font-black">
              No intelligence found for "{query}"
            </div>
          ) : (
             <div className="py-12 text-center text-white/20 text-[10px] uppercase tracking-[0.3em] font-black opacity-50">
               Start typing to search global network intelligence...
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-black/40 flex justify-between items-center text-[9px] text-white/40 uppercase tracking-[0.2em] font-black">
           <div>Navigation: <span className="text-white">↑↓</span> Select: <span className="text-white">ENTER</span></div>
           <div>Global Intelligence Unit</div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  )
}
