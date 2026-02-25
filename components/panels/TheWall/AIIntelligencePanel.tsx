import React from 'react'
import { Brain, ShieldCheck, MapPin, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

interface AIReport {
  summary: string
  criticalZones: string[]
  threatLevel: string
  timestamp: string
}

export default function AIIntelligencePanel({ report }: { report: AIReport | undefined }) {
  const { t } = useLanguage();
  if (!report) return null

  const getThreatColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-shutdown border-shutdown/30 bg-shutdown-bg'
      case 'high': return 'text-attack border-attack/30 bg-attack-bg'
      case 'moderate': return 'text-censorship border-censorship/30 bg-censorship-bg'
      default: return 'text-normal border-normal/30 bg-normal-bg'
    }
  }

  return (
    <div className="border border-white/10 bg-bg-overlay p-6 mb-8 rounded-sm overflow-hidden relative group">
      {/* Background Brain Icon Decal */}
      <Brain className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:text-white/10 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 border border-white/10 rounded">
                <Brain className="w-5 h-5 text-white" />
             </div>
             <div>
                <h3 className="text-sm font-bold uppercase tracking-tight">{t.ai_report}</h3>
                <div className="text-[9px] text-muted uppercase tracking-widest flex items-center gap-2 font-bold">
                  <Clock className="w-3 h-3" /> {t.ai_update} // Llama 3.1 8B
                </div>
             </div>
          </div>
          
          <div className={`px-3 py-1 border rounded text-[10px] font-black uppercase tracking-widest ${getThreatColor(report.threatLevel)}`}>
            {report.threatLevel} {t.status.toUpperCase()}
          </div>
        </div>

        <p className="text-sm text-white/90 leading-relaxed mb-6 italic border-l-2 border-white/30 pl-4 bg-white/[0.03] py-3 font-medium">
          "{report.summary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-[10px] uppercase text-white/50 tracking-widest flex items-center gap-2 font-bold">
              <MapPin className="w-3 h-3" /> {t.critical_zones}
            </div>
            <div className="flex flex-wrap gap-2">
              {report.criticalZones.map((zone, idx) => (
                <span key={idx} className="text-[10px] bg-black/60 border border-white/20 px-2.5 py-1.5 text-white uppercase font-black tracking-tight shadow-sm hover:border-white/40 transition-colors">
                  {zone}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] uppercase text-white/50 tracking-widest flex items-center gap-2 font-bold">
              <ShieldCheck className="w-3 h-3" /> {t.analyst_verification}
            </div>
            <div className="text-[11px] text-white/70 leading-snug font-medium">
               Automated correlation of <span className="text-white font-bold">IODA</span>, <span className="text-white font-bold">OONI</span>, and <span className="text-white font-bold">NASA Satellite</span> signals.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
