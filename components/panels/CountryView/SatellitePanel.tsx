import React from 'react'
import { Flame, Moon, ZapOff, Activity } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

interface SatelliteData {
  thermalEvents: number
  thermalAnomalies: any[]
}

export default function SatellitePanel({ data, countryName }: { data: SatelliteData, countryName: string }) {
  const { t } = useLanguage();
  const isHighRisk = data.thermalEvents > 20

  return (
    <div className="border border-border bg-bg-raised p-6 rounded-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-white/80">
          <Moon className="w-4 h-4 text-white/40" /> {t.satellite_intel}
        </h3>
        <span className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">Source: NASA VIIRS / FIRMS</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 border ${isHighRisk ? 'border-shutdown/40 bg-shutdown-bg shadow-[0_0_10px_rgba(255,51,51,0.1)]' : 'border-white/10 bg-black/40'} rounded-sm`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className={`w-3.5 h-3.5 ${isHighRisk ? 'text-shutdown' : 'text-white/40'}`} />
            <span className="text-[10px] uppercase text-white/60 font-black tracking-widest">{t.thermal_events}</span>
          </div>
          <div className={`text-2xl font-black tabular-nums ${isHighRisk ? 'text-shutdown' : 'text-white'}`}>
            {data.thermalEvents}
          </div>
          <div className="text-[9px] uppercase mt-1 text-white/30 font-bold">Last 24 Hours</div>
        </div>

        <div className="p-4 border border-white/10 bg-black/40 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase text-white/60 font-black tracking-widest">{t.light_intensity}</span>
          </div>
          <div className="text-2xl font-black tabular-nums text-normal opacity-90">
            STABLE
          </div>
          <div className="text-[9px] uppercase mt-1 text-white/30 font-bold">NASA Black Marble</div>
        </div>
      </div>

      {data.thermalEvents > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase text-white/50 tracking-[0.15em] mb-2 border-b border-white/10 pb-2 font-black">Recent Heat Anomalies (Fires/Explosions)</div>
          <div className="max-h-[150px] overflow-y-auto pr-2 space-y-2 scrollbar-thin">
            {data.thermalAnomalies.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] border-l-2 border-white/20 pl-4 py-1 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <div className="flex flex-col">
                  <span className="text-white font-bold">Lat: {event.latitude.toFixed(3)} // Lng: {event.longitude.toFixed(3)}</span>
                  <span className="text-[9px] text-white/40 uppercase font-black">Brightness: {event.brightness}K</span>
                </div>
                <div className="text-white/60 tabular-nums font-mono text-[10px]">
                  {event.acq_time} UTC
                </div>
              </div>
            ))}
          </div>
          {isHighRisk && (
            <div className="mt-4 p-3 bg-shutdown-bg border border-shutdown/40 rounded-sm flex items-start gap-3 shadow-lg">
               <ZapOff className="w-4 h-4 text-shutdown mt-0.5 animate-pulse" />
               <p className="text-[10px] text-shutdown font-black uppercase leading-relaxed tracking-tight">
                 {t.physical_damage}: High thermal activity suggests conflict or infrastructure destruction.
               </p>
            </div>
          )}
        </div>
      )}

      {data.thermalEvents === 0 && (
        <div className="py-10 text-center border border-dashed border-white/10 rounded-sm bg-white/[0.01]">
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">No thermal anomalies detected in {countryName} airspace</p>
        </div>
      )}
    </div>
  )
}
