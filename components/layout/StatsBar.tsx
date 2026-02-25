'use client'

import useSWR from 'swr'
import { useLanguage } from "@/lib/LanguageContext"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function StatsBar() {
  const { t } = useLanguage();
  const { data, error, isLoading } = useSWR('/api/events', fetcher, {
    refreshInterval: 60000, // Refresh a cada minuto
  })

  const summary = data?.summary
  const shutdowns = summary?.shutdowns || 0
  const attacks = summary?.attacks || 0
  const sourcesCount = summary?.activeSources || 0
  const totalSources = summary?.sources || 10
  const countriesCount = summary?.countries || 196

  return (
    <div className="grid grid-cols-4 h-16 border-b border-border bg-bg-raised divide-x divide-border">
      {/* SHUTDOWNS */}
      <div className="flex flex-col justify-center px-6">
        <span className="text-[10px] text-muted uppercase tracking-widest mb-1">{t.active_shutdowns}</span>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tabular-nums ${shutdowns > 0 ? 'text-shutdown text-glow-shutdown' : 'text-primary'}`}>
            {isLoading ? '--' : shutdowns}
          </span>
          <span className="text-[9px] text-shutdown px-1 border border-shutdown/20 bg-shutdown-bg rounded uppercase font-black">IODA Live</span>
        </div>
      </div>

      {/* ATTACKS */}
      <div className="flex flex-col justify-center px-6">
        <span className="text-[10px] text-muted uppercase tracking-widest mb-1">{t.attacks_24h}</span>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tabular-nums ${attacks > 0 ? 'text-attack text-glow-attack' : 'text-primary'}`}>
            {isLoading ? '--' : attacks}
          </span>
          <span className="text-[9px] text-attack px-1 border border-attack/20 bg-attack-bg rounded uppercase font-black">Cloudflare</span>
        </div>
      </div>

      {/* COUNTRIES */}
      <div className="flex flex-col justify-center px-6">
        <span className="text-[10px] text-muted uppercase tracking-widest mb-1">{t.monitored_countries}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-primary">
            {countriesCount}
          </span>
          <span className="text-[9px] text-muted px-1 border border-white/10 bg-white/5 rounded uppercase font-black">Global CC</span>
        </div>
      </div>

      {/* SOURCES */}
      <div className="flex flex-col justify-center px-6">
        <span className="text-[10px] text-muted uppercase tracking-widest mb-1">{t.active_sources}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-white">
            {isLoading ? '--' : sourcesCount}
          </span>
          <span className="text-muted text-[10px] font-black">/ {totalSources}</span>
          <span className="text-[9px] text-normal px-1 border border-normal/20 bg-normal-bg rounded uppercase ml-auto font-black">{t.verified}</span>
        </div>
      </div>
    </div>
  );
}
