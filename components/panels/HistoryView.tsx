'use client'

import React from 'react'
import useSWR from 'swr'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import { Calendar, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HistoryView() {
  const { t } = useLanguage();
  const { data, error, isLoading } = useSWR('/api/history', fetcher)

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-white/40 text-[11px] uppercase tracking-[0.3em] animate-pulse font-black">
        Retrieving Historical Archives...
      </div>
    </div>
  )

  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-center px-10">
      <div>
        <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-black">{t.no_history}</p>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full bg-black overflow-y-auto p-8 scrollbar-thin">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-normal" /> {t.history_30d}
            </h2>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1 font-bold">Global Archive // {data.length} snapshots stored</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart: Total Events over time */}
          <div className="border border-white/10 bg-bg-raised p-8 rounded-sm shadow-xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-white/60 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-shutdown" /> {t.total_events}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ background: '#000000', border: '1px solid #ffffff20', fontSize: '10px' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="totalEvents" fill="var(--shutdown)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="censorship" fill="var(--censorship)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart: Average Confidence */}
          <div className="border border-border bg-bg-raised p-8 rounded-sm shadow-xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-white/60 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-normal" /> {t.avg_confidence}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#000000', border: '1px solid #ffffff20', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="averageConfidence" stroke="var(--normal)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-white/10 bg-bg-raised rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40 italic text-center">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40 italic text-center">Shutdowns</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40 italic text-center">Censorship</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-white/40 italic text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.slice().reverse().map((day: any) => (
                <tr key={day.date} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-xs font-bold tabular-nums text-white/80 text-center">{day.date}</td>
                  <td className="px-6 py-4 text-xs font-black tabular-nums text-shutdown text-center">{day.shutdowns}</td>
                  <td className="px-6 py-4 text-xs font-black tabular-nums text-censorship text-center">{day.censorship}</td>
                  <td className="px-6 py-4 text-xs font-black tabular-nums text-normal text-center">{Math.round(day.averageConfidence)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
