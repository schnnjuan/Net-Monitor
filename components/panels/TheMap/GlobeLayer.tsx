'use client'

import React, { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import Link from 'next/link'
import cablesData from '@/data/cables.json'
import { Anchor } from 'lucide-react'

const COLORS = {
  shutdown: '#ff0000',
  censorship: '#ffaa00',
  conflict: '#ff4400',
  security: '#888888',
  normal: '#00ff66',
  muted: '#4a4a4a',
  cable: '#00ccff'
};

const NASA_NIGHT_LIGHTS = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';
const GLOBE_BUMP_MAP = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

interface GlobeLayerProps {
  events: any[]
  countries: any[]
}

export default function GlobeLayer({ events, countries }: GlobeLayerProps) {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCables, setShowCables] = useState(true);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64 // Adjust for Header
      });
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Point styling logic
  const getPointColor = (event: any) => {
    if (event.category === 'shutdown') return COLORS.shutdown;
    if (event.category === 'conflict') return COLORS.conflict;
    if (event.category === 'security_filter') return COLORS.security;
    return COLORS.censorship;
  };

  const getPointSize = (event: any) => {
    return event.severity === 'critical' ? 0.6 : 0.35;
  };

  return (
    <div className="w-full h-full relative cursor-crosshair">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={NASA_NIGHT_LIGHTS}
        bumpImageUrl={GLOBE_BUMP_MAP}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Surveillance Mesh (Subtle Dots)
        pointsData={events}
        pointLat="lat"
        pointLng="lng"
        pointColor={getPointColor}
        pointAltitude={0.01}
        pointRadius={getPointSize}
        pointsMerge={false}
        onPointClick={(point: any) => setSelectedEvent(point)}

        // Submarine Cables (Physical Layer - Submerged Paths)
        pathsData={showCables ? cablesData : []}
        pathPoints="path"
        pathColor={(d: any) => d.color || COLORS.cable}
        pathDashLength={0.1}
        pathDashGap={0.008}
        pathDashAnimateTime={12000}
        pathStroke={0.5}
        pathResolution={2}

        // Labels (Country Names for events)
        labelsData={events}
        labelLat="lat"
        labelLng="lng"
        labelText="countryName"
        labelSize={0.5}
        labelDotRadius={0}
        labelColor={() => 'rgba(255, 255, 255, 0.7)'}
        labelResolution={2}

        // Atmosphere styling
        showAtmosphere={true}
        atmosphereColor="#00ff66"
        atmosphereAltitude={0.15}
      />

      {/* Layer Toggle: Cables */}
      <div className="absolute top-24 left-6 z-[1000]">
        <button 
          onClick={() => setShowCables(!showCables)}
          className={`flex items-center gap-3 p-3 border-2 transition-all rounded-sm shadow-2xl group ${showCables ? 'bg-black border-cable text-cable' : 'bg-black/80 border-white/10 text-white/40'}`}
        >
          <Anchor className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">{showCables ? 'Hide Physical Layer' : 'Show Physical Layer'}</span>
        </button>
      </div>

      {/* Manual 3D Popup Overlays */}
      {selectedEvent && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] pointer-events-none">
            <div className="bg-black border-2 border-white/20 p-6 font-mono text-[12px] text-white min-w-[300px] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm pointer-events-auto backdrop-blur-md">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-2 right-2 text-white/40 hover:text-white uppercase font-black text-[10px]"
                >
                  [CLOSE]
                </button>
                <div className="font-black uppercase mb-3 text-base flex justify-between border-b-2 border-white/10 pb-3">
                  <span>{selectedEvent.countryName}</span>
                  <span className="text-white/40">{selectedEvent.countryCode}</span>
                </div>
                <div 
                  className="font-black mb-4 uppercase tracking-[0.2em] py-1 px-2 rounded-sm inline-block" 
                  style={{ 
                    backgroundColor: getPointColor(selectedEvent) + '33', 
                    color: getPointColor(selectedEvent) 
                  }}
                >
                  {selectedEvent.category.toUpperCase().replace('_', ' ')} // {selectedEvent.severity}
                </div>
                <div className="text-white leading-relaxed mb-5 bg-white/[0.05] p-3 border-l-4 border-white/20 font-bold max-h-[150px] overflow-y-auto scrollbar-thin">
                  {selectedEvent.description}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest bg-white/5 p-2 rounded-sm tabular-nums">
                    Confidence: <span className="text-white">{selectedEvent.confidence}%</span> // {new Date(selectedEvent.detectedAt).toLocaleTimeString()}
                  </div>
                  <Link 
                    href={`/country/${selectedEvent.countryCode}`}
                    className="w-full bg-white text-black text-center py-3 font-black uppercase hover:bg-normal transition-all rounded-sm shadow-xl tracking-widest text-xs"
                  >
                    View Full Intel
                  </Link>
                </div>
            </div>
        </div>
      )}

      {/* Legend Overlay (Reuse from MapLayer) */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-black/80 border border-white/10 p-4 backdrop-blur-md rounded-sm">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-black">Global Threat Legend</div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-shutdown shadow-[0_0_10px_#ff0000]" />
            <span className="text-[10px] uppercase font-black text-white/80">Shutdown</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-censorship shadow-[0_0_10px_#ffaa00]" />
            <span className="text-[10px] uppercase font-black text-white/80">Censorship</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-attack shadow-[0_0_10px_#ff4400]" />
            <span className="text-[10px] uppercase font-black text-white/80">Kinetic Conflict</span>
          </div>
        </div>
      </div>
    </div>
  )
}
