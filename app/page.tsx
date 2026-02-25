'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Header from "@/components/layout/Header";
import StatsBar from "@/components/layout/StatsBar";
import TheMap from "@/components/panels/TheMap";
import CommandPalette from "@/components/layout/CommandPalette";
import AIIntelligencePanel from "@/components/panels/TheWall/AIIntelligencePanel";
import HistoryView from "@/components/panels/HistoryView";
import { NetworkEvent } from '@/lib/types'
import { useLanguage } from "@/lib/LanguageContext";
import { ChevronDown, ChevronUp } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function ExpandableTargets({ targets }: { targets: string[] }) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!targets || targets.length === 0) return null;

  return (
    <div className="mt-6 border-t border-white/5 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase text-white/40 font-black tracking-widest">
          Detected Targets: <span className="text-white bg-white/10 px-2 py-0.5 rounded-sm ml-2">{targets.length}</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[10px] uppercase font-black text-censorship hover:text-white transition-colors tracking-widest bg-censorship/10 px-3 py-1 rounded-sm border border-censorship/20"
        >
          {isExpanded ? (
            <> {t.show_less} <ChevronUp className="w-3 h-3" /> </>
          ) : (
            <> {t.show_more} <ChevronDown className="w-3 h-3" /> </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {targets.map((target, i) => (
            <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-sm text-white/60 hover:border-white/30 transition-all">
              {target}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [view, setView] = useState<'map' | 'wall' | 'history'>('map')
  const { data, error } = useSWR('/api/events', fetcher, {
    refreshInterval: 180000,
  })

  const events: NetworkEvent[] = data?.events || []
  const aiReport = data?.intelligence;

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-black relative">
      <CommandPalette events={events} />
      <Header currentView={view} setView={setView} />
      <StatsBar />

      <div className="flex-1 relative border-t border-border overflow-hidden">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-shutdown font-black uppercase tracking-widest text-glow-shutdown">
            {t.uplink_error}
          </div>
        ) : view === 'map' ? (
          <TheMap events={events} />
        ) : view === 'history' ? (
          <HistoryView />
        ) : (
          <div className="w-full h-full bg-black overflow-y-auto p-8 scrollbar-thin">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <AIIntelligencePanel report={aiReport} />

              <h2 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6 border-b border-white/10 pb-4 flex items-center justify-between font-black">
                 <span>{t.intelligence_feed}</span>
                 <span className="text-normal text-glow-normal tabular-nums">SCANNING {events.length} NODES</span>
              </h2>

              {events.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-sm bg-white/[0.01]">
                  <p className="text-white/20 text-sm font-black uppercase tracking-[0.4em]">{t.no_anomalies}</p>
                </div>
              ) : (
                events.map((event: NetworkEvent) => {
                  const categoryColors: Record<string, string> = {
                    shutdown: 'border-shutdown/30 bg-shutdown-bg/10 glow-shutdown text-shutdown',
                    censorship: 'border-censorship/30 bg-censorship-bg/10 glow-censorship text-censorship',
                    conflict: 'border-attack/30 bg-attack-bg/10 glow-attack text-attack',
                    security_filter: 'border-white/10 bg-white/5 text-white/40'
                  };
                  const colorClass = categoryColors[event.category] || categoryColors.censorship;
                  const pulseClass = event.category === 'shutdown' ? 'bg-shutdown shadow-shutdown' : 
                                     event.category === 'conflict' ? 'bg-attack shadow-attack' : 
                                     event.category === 'security_filter' ? 'bg-white/20' : 'bg-censorship shadow-censorship';

                  return (
                    <div key={event.id} className={`p-8 border-2 rounded-sm transition-all shadow-2xl relative overflow-hidden group ${colorClass}`}>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                          <span className={`w-4 h-4 rounded-full animate-pulse-fast shadow-2xl ${pulseClass}`} />
                          <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:scale-[1.01] transition-transform origin-left leading-none">
                              {event.countryName}
                            </h3>
                            <div className="text-xs font-black text-white/40 mt-1 uppercase tracking-widest flex items-center gap-2">
                              {event.countryCode} <span className="opacity-20">|</span> 
                              <span className={colorClass.split(' ').pop()}>
                                {event.category.toUpperCase().replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-black px-3 py-1 rounded-sm uppercase tracking-widest mb-2 ${
                            event.category === 'shutdown' ? 'bg-shutdown text-white' : 
                            event.category === 'conflict' ? 'bg-attack text-white' : 'bg-censorship text-black'
                          }`}>
                            {event.severity}
                          </div>
                          <span className="text-[10px] font-mono text-white/40 font-black tabular-nums">{new Date(event.detectedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-lg text-white/90 font-bold leading-tight mb-8 border-l-4 border-white/20 pl-6 py-2 bg-white/[0.03]">
                        {event.description}
                      </p>

                    {event.targets && <ExpandableTargets targets={event.targets} />}

                    <div className="flex items-center justify-between gap-10 border-t border-white/10 pt-6">
                      <div className="flex gap-3">
                        {event.sources.map((s: string) => (
                          <span key={s} className="text-[11px] bg-white/10 border-2 border-white/10 px-4 py-1.5 text-white font-black uppercase hover:bg-white hover:text-black transition-all cursor-help tracking-widest shadow-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex-1 flex items-center gap-6">
                        <div className="flex-1 h-2 bg-white/10 relative rounded-full overflow-hidden shadow-inner border border-white/5">
                           <div 
                             className={`h-full absolute left-0 top-0 transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.8)] ${
                               event.confidence > 80 ? 'bg-normal' : event.confidence > 50 ? 'bg-censorship' : 'bg-muted'
                             }`}
                             style={{ width: `${event.confidence}%` }}
                           />
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white font-black">
                          {t.confidence}: <span className="text-white text-xl tabular-nums">{event.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="h-10 border-t border-border px-6 flex items-center justify-between text-[11px] text-white/40 uppercase tracking-[0.3em] bg-black z-50 font-black">
        <div className="flex gap-10">
          <span className="text-normal text-glow-normal">● SYSTEM ONLINE</span>
          <span className="opacity-20">|</span>
          <span className="text-white/60">UPLINK: SECURE</span>
        </div>
        <div className="flex gap-10 tabular-nums font-mono text-white/60">
          <span>RECV: {data?.sourcesPolled?.length} NODES</span>
          <span>LATENCY: {data?.fromCache ? 'REDIS_HIT' : 'LIVE_DATA'}</span>
        </div>
      </footer>
    </main>
  );
}
