'use client'

import React, { use } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowLeft, Wifi, ShieldAlert, History, Anchor, Newspaper } from 'lucide-react'
import Header from "@/components/layout/Header"
import SatellitePanel from "@/components/panels/CountryView/SatellitePanel"
import { useLanguage } from "@/lib/LanguageContext"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { t } = useLanguage();
  const resolvedParams = use(params)
  const code = resolvedParams.code.toUpperCase()
  const { data, error, isLoading } = useSWR(`/api/country/${code}`, fetcher)

  if (error) return (
    <div className="h-screen bg-black flex items-center justify-center text-shutdown font-mono text-sm uppercase font-black tracking-widest px-10 text-center">
      {t.uplink_error} // {code}
    </div>
  )

  if (isLoading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-white/60 text-[11px] uppercase tracking-[0.3em] animate-pulse font-black">
        ESTABLISHING SECURE UPLINK // {code} // ...
      </div>
    </div>
  )

  const { country, signals, ooni, historical, submarineCables, satellite, cyberSecurity, news } = data

  // Dynamic Risk Score Calculation
  const freedomWeight = historical.freedomStatus === 'Not Free' ? 50 : historical.freedomStatus === 'Partly Free' ? 25 : 0;
  const historyWeight = Math.min(30, historical.score * 2);
  const currentRiskWeight = satellite.thermalEvents > 10 ? 20 : 0;
  const calculatedRisk = Math.min(99, freedomWeight + historyWeight + currentRiskWeight);

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-black">
      <Header currentView='map' setView={() => {}} />

      {/* Hero Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-bg-raised shadow-xl relative z-20">
        <div className="flex items-center gap-8">
          <Link href="/" className="p-2.5 hover:bg-white/10 border border-white/20 rounded transition-all group shadow-sm">
            <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4 text-white">
              {country.name} <span className="text-white/20 font-normal tracking-normal text-xl">// {code}</span>
            </h1>
            <div className="flex items-center gap-4 mt-1 text-[11px] uppercase tracking-[0.2em] font-black">
              <span className="text-normal opacity-90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-normal animate-pulse" />
                {t.live}
              </span>
              <span className="text-white/10">|</span>
              <span className="text-white/40">{t.status}: {t.system_nominal}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-6">
          <div className="bg-shutdown-bg border border-shutdown/40 px-6 py-3 rounded-sm text-center shadow-lg">
             <div className="text-[10px] uppercase text-white/40 mb-1 font-black tracking-widest">{t.risk_score}</div>
             <div className="text-3xl font-black text-shutdown tabular-nums">{calculatedRisk}/100</div>
          </div>
          <div className="bg-white/5 border border-white/20 px-6 py-3 rounded-sm text-center shadow-lg">
             <div className="text-[10px] uppercase text-white/40 mb-1 font-black tracking-widest">{t.status}</div>
             <div className="text-3xl font-black uppercase text-white tracking-tighter shadow-sm">
               {historical.freedomStatus === 'Not Free' ? t.restricted : historical.freedomStatus === 'Partly Free' ? t.moderate : t.open}
             </div>
          </div>
        </div>
      </div>

      {/* Grid de Dados */}
      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 scrollbar-thin">
        
        {/* Coluna 1: Dados Técnicos (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Traffic Chart Card */}
          <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                 <Wifi className="w-5 h-5 text-normal opacity-80" /> {t.traffic_24h}
               </h3>
               <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Source: IODA / CAIDA</span>
             </div>
             
             <div className="h-[300px] w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={signals}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                   <XAxis 
                     dataKey="time" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#ffffff40', fontSize: 11, fontWeight: 900 }}
                     interval={4} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#ffffff40', fontSize: 11, fontWeight: 900 }}
                     domain={['auto', 'auto']}
                   />
                   <Tooltip 
                     contentStyle={{ background: '#000000', border: '1px solid #ffffff20', fontSize: '11px', color: '#ffffff', fontWeight: 900, borderRadius: '4px' }}
                     itemStyle={{ color: '#22c55e' }}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="value" 
                     stroke="var(--normal)" 
                     strokeWidth={4} 
                     dot={false}
                     animationDuration={2000}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* OONI Results Card */}
          <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                 <ShieldAlert className="w-5 h-5 text-censorship opacity-80" /> {t.confirmed_censorship}
               </h3>
               <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Source: Tor Project / OONI</span>
             </div>
             
             {ooni.length === 0 ? (
               <div className="py-20 text-center text-white/20 text-sm uppercase tracking-[0.3em] font-black bg-white/[0.01] border border-dashed border-white/10 rounded-sm shadow-inner">
                 No anomalies confirmed in the last cycle
               </div>
             ) : (
               <div className="space-y-6">
                 {ooni.map((e: any) => (
                   <div key={e.id} className="p-6 border border-white/10 hover:border-white/30 transition-all bg-black shadow-lg rounded-sm group relative overflow-hidden">
                     <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-[11px] bg-censorship-bg border border-censorship-border text-censorship px-2.5 py-1 rounded uppercase font-black tracking-widest shadow-sm">
                          {t.confirmed_censorship.split(' ')[1]}
                        </span>
                        <span className="text-[11px] text-white/40 font-mono font-black tabular-nums">{new Date(e.detectedAt).toLocaleString()}</span>
                     </div>
                     {e.targets ? (
                       <div className="space-y-4">
                         <div className="text-[11px] text-white/40 uppercase font-black tracking-widest mb-2 border-b border-white/5 pb-2">
                           Total unique targets: {e.targets.length}
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {e.targets.map((target: string, i: number) => (
                             <span key={i} className="text-[11px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-sm text-white/80 hover:border-censorship/40 transition-colors">
                               {target}
                             </span>
                           ))}
                         </div>
                       </div>
                     ) : (
                       <p className="text-base text-white/90 font-bold leading-relaxed group-hover:text-white transition-colors relative z-10">{e.description}</p>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Coluna 2: Contexto e Geopolítica */}
        <div className="space-y-8">
           {/* Satellite Intelligence Panel (NASA) */}
           <SatellitePanel data={satellite} countryName={country.name} />

           {/* Live News Feed (GDELT 2.0 with Fallback) */}
           <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl group">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-white">
               <Newspaper className="w-5 h-5 text-white/40" /> Geopolitical Context (GDELT)
             </h3>
             <div className="space-y-5">
               {news && news.length > 0 ? (
                 news.map((article: any, idx: number) => (
                   <a 
                     key={idx} 
                     href={article.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="block p-5 bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.05] transition-all rounded-sm shadow-sm"
                   >
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase text-normal font-black tracking-widest bg-normal-bg border border-normal/20 px-2 py-0.5 rounded-sm">{article.source}</span>
                        <span className="text-[10px] text-white/40 font-mono font-bold tabular-nums">{new Date(article.publishedAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-sm text-white font-bold leading-snug line-clamp-3 hover:text-normal transition-colors">{article.title}</p>
                   </a>
                 ))
               ) : (
                 <div className="py-16 text-center border border-dashed border-white/10 rounded-sm bg-white/[0.01]">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black italic">Uplink active: Waiting for signals...</p>
                 </div>
               )}
             </div>
           </div>

           {/* Cyber Security Intelligence (GreyNoise + Cloudflare) */}
           <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl relative overflow-hidden group">
             <div className="absolute -top-4 -right-4 p-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <ShieldAlert className="w-32 h-32 text-white" />
             </div>
             <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-white">
               <ShieldAlert className="w-5 h-5 text-attack" /> Cyber Intelligence
             </h3>
             <div className="space-y-8">
               <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div className="text-[11px] uppercase text-white/40 font-black tracking-widest leading-none">Attacking IPs (24h)</div>
                  <div className="text-4xl font-black tabular-nums text-attack shadow-sm leading-none">{cyberSecurity.attackingIPs}</div>
               </div>
               <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div className="text-[11px] uppercase text-white/40 font-black tracking-widest leading-none">DDoS Risk Level</div>
                  <div className={`text-2xl font-black uppercase tracking-tighter leading-none shadow-sm ${cyberSecurity.ddosRisk === 'HIGH' ? 'text-shutdown animate-pulse' : 'text-normal'}`}>
                    {cyberSecurity.ddosRisk === 'HIGH' ? t.high : t.stable}
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="text-[10px] uppercase text-white/40 font-black tracking-widest">Active Threat Tags</div>
                  <div className="flex flex-wrap gap-2.5">
                    {cyberSecurity.tags.slice(0, 6).map((tag: any) => (
                      <span key={tag.tag} className="text-[10px] bg-attack-bg border border-attack/30 text-attack px-2.5 py-1 rounded-sm font-black uppercase shadow-sm hover:border-attack/60 transition-colors">
                        {tag.tag}
                      </span>
                    ))}
                    {cyberSecurity.tags.length === 0 && <span className="text-[11px] text-white/20 italic font-black">No active threats detected</span>}
                  </div>
               </div>
             </div>
           </div>

           {/* Infrastructure Card */}
           <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-white">
               <Anchor className="w-5 h-5 text-white/40" /> {t.infrastructure}
             </h3>
             <div className="space-y-6">
                <div className="text-[10px] uppercase text-white/40 mb-4 tracking-[0.2em] font-black border-b border-white/10 pb-2">{t.cables}</div>
                <div className="space-y-3">
                  {submarineCables.map((cable: any) => (
                    <div key={cable.name} className="flex items-center justify-between border-l-4 border-normal/40 pl-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-r-sm shadow-sm group">
                      <span className="text-sm text-white font-black group-hover:translate-x-1 transition-transform">{cable.name}</span>
                      <span className="text-[10px] uppercase text-normal font-black tracking-widest opacity-80 italic">{t.stable}</span>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           {/* Strategic Intelligence Card */}
           <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-white">
               <History className="w-5 h-5 text-white/40" /> {t.strategic_intel}
             </h3>
             <div className="space-y-8">
               <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div className="text-[11px] uppercase text-white/40 font-black tracking-widest">{t.past_outages}</div>
                  <div className="text-3xl font-black tabular-nums text-white leading-none shadow-sm">{historical.score}</div>
               </div>
               <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div className="text-[11px] uppercase text-white/40 font-black tracking-widest">{t.instability}</div>
                  <div className="text-2xl font-black text-attack uppercase tracking-tighter shadow-sm leading-none">
                    {historical.freedomStatus === 'Not Free' ? t.critical : historical.freedomStatus === 'Partly Free' ? t.moderate : t.stable}
                  </div>
               </div>
               <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div className="text-[11px] uppercase text-white/40 font-black tracking-widest">{t.media_freedom}</div>
                  <div className="text-2xl font-black text-shutdown uppercase tracking-tighter shadow-sm leading-none">
                    {historical.freedomStatus === 'Not Free' ? t.restricted : t.open}
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* Rodapé de Coordenadas */}
      <footer className="h-8 border-t border-border px-4 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-[0.3em] bg-black font-black">
        <div>Lat: {country.lat.toFixed(4)} // Lng: {country.lng.toFixed(4)}</div>
        <div>Uptime: 99.98% // Relay: Secure // {new Date().getFullYear()}</div>
      </footer>
    </main>
  );
}
