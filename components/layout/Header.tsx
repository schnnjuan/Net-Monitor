'use client'

import LiveClock from "@/components/ui/LiveClock";
import { Search, Languages } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface HeaderProps {
  currentView: 'map' | 'wall' | 'history'
  setView: (view: 'map' | 'wall' | 'history') => void
}

export default function Header({ currentView, setView }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-black z-50 shadow-2xl">
      <div className="flex items-center gap-6 h-full">
        {/* Logo / Nome */}
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="Net Monitor Logo" className="w-5 h-5 shadow-sm" />
          <h1 className="text-sm font-black tracking-tighter uppercase text-white">
            {t.title} <span className="text-white/20 ml-1 font-normal opacity-50">/</span> <span className="text-xs text-shutdown font-black">BETA</span>
          </h1>
        </div>

        {/* View Switcher (Tabs) */}
        <nav className="flex h-full">
          <button 
            onClick={() => setView('map')}
            className={`px-4 text-[11px] uppercase tracking-[0.2em] h-full border-b-2 transition-all font-black ${currentView === 'map' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            {t.map}
          </button>
          <button 
            onClick={() => setView('wall')}
            className={`px-4 text-[11px] uppercase tracking-[0.2em] h-full border-b-2 transition-all font-black ${currentView === 'wall' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            {t.wall}
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 text-[11px] uppercase tracking-[0.2em] h-full border-b-2 transition-all font-black ${currentView === 'history' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            {t.history}
          </button>
        </nav>

        {/* Search Hint */}
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-white/10 bg-white/5 text-[9px] text-muted tracking-widest uppercase cursor-pointer hover:bg-white/10 transition-colors">
          <Search className="w-3 h-3" />
          <span>{t.search_hint.split('Cmd+K')[0]}<span className="text-white font-bold">Cmd+K</span>{t.search_hint.split('Cmd+K')[1]}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest">
        {/* Language Switcher */}
        <button 
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="flex items-center gap-2 px-2 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors text-muted hover:text-white"
        >
          <Languages className="w-3 h-3" />
          <span className="font-bold">{language.toUpperCase()}</span>
        </button>

        <div className="flex items-center gap-2 px-2 py-1 rounded bg-normal-bg border border-normal/20">
          <span className="w-1.5 h-1.5 rounded-full bg-normal animate-pulse" />
          <span className="text-normal font-bold">{t.live}</span>
        </div>
        <LiveClock />
      </div>
    </header>
  );
}
