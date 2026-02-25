'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Globe as GlobeIcon, Map as MapIcon } from 'lucide-react'

import countriesData from '@/data/countries.json'

// Globe is client-side only
const GlobeLayer = dynamic(() => import('./GlobeLayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 animate-pulse font-black">
        INITIALIZING GLOBAL SURVEILLANCE MESH...
      </div>
    </div>
  )
})

// Leaflet Map (2D)
const MapLayer = dynamic(() => import('./MapLayer'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />
})

interface TheMapProps {
  events: any[]
}

export default function TheMap({ events }: TheMapProps) {
  const [is3D, setIs3D] = useState(true);

  return (
    <div className="w-full h-full relative">
      {is3D ? (
        <GlobeLayer events={events} countries={countriesData} />
      ) : (
        <MapLayer events={events} countries={countriesData} />
      )}

      {/* Layer Toggle Switch */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => setIs3D(!is3D)}
          className="bg-black/80 border-2 border-white/20 p-3 hover:border-normal transition-all rounded-sm shadow-2xl group flex items-center gap-3"
        >
          {is3D ? (
            <>
              <MapIcon className="w-5 h-5 text-white/60 group-hover:text-normal" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Switch to 2D Plane</span>
            </>
          ) : (
            <>
              <GlobeIcon className="w-5 h-5 text-white/60 group-hover:text-normal" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Switch to 3D Globe</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
