'use client'

import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from 'react-leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import LivePulseLayer from './LivePulseLayer'

const { BaseLayer, Overlay } = LayersControl;

// Tiles definitions
const TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const NASA_NIGHT_LIGHTS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png'
const NASA_FIRMS_THERMAL = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/FIRMS_MODIS_Thermal_Hotspots/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png'

// Hex Colors for Leaflet (Direct injection to avoid CSS var resolution issues in SVG)
const COLORS = {
  shutdown: '#ff0000',
  censorship: '#ffaa00',
  conflict: '#ff4400',
  security: '#888888',
  normal: '#00ff66',
  muted: '#4a4a4a'
};

interface MapLayerProps {
  events: any[]
  countries: any[]
}

export default function MapLayer({ events, countries }: MapLayerProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={8}
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#000' }}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="Intelligence Dark">
          <TileLayer url={TILES} />
        </BaseLayer>
        
        <BaseLayer name="NASA Night Lights (Outage Check)">
          <TileLayer url={NASA_NIGHT_LIGHTS} attribution="NASA Earthdata" />
        </BaseLayer>

        <Overlay name="Thermal Anomalies (NASA FIRMS)">
          <TileLayer 
            url={NASA_FIRMS_THERMAL} 
            attribution="NASA FIRMS"
            opacity={0.8}
          />
        </Overlay>

        <Overlay checked name="RIPE Atlas Live Stream">
           <LivePulseLayer />
        </Overlay>
      </LayersControl>

      {/* Global Surveillance Mesh - Subtle points for every monitored country */}
      {countries.map((c) => (
        <CircleMarker
          key={`mesh-${c.code}`}
          center={[c.lat, c.lng]}
          radius={1.5}
          pathOptions={{
            color: COLORS.normal,
            fillColor: COLORS.normal,
            fillOpacity: 0.25,
            weight: 0,
          }}
          interactive={false}
        />
      ))}

      {events.map((event) => {
        const color = event.category === 'shutdown' ? COLORS.shutdown : 
                      event.category === 'conflict' ? COLORS.conflict :
                      event.category === 'security_filter' ? COLORS.security : COLORS.censorship;
        const radius = event.severity === 'critical' ? 16 : event.severity === 'high' ? 12 : 8;

        return (
          <CircleMarker
            key={event.id}
            center={[event.lat, event.lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.8,
              weight: 3,
            }}
          >
            <Popup>
              <div className="bg-black border-2 border-white/20 p-5 font-mono text-[12px] text-white min-w-[240px] shadow-2xl rounded-sm">
                <div className="font-black uppercase mb-3 text-base flex justify-between border-b-2 border-white/10 pb-3">
                  <span>{event.countryName}</span>
                  <span className="text-white/40">{event.countryCode}</span>
                </div>
                <div className="font-black mb-4 uppercase tracking-[0.2em] py-1 px-2 rounded-sm inline-block" style={{ backgroundColor: color + '33', color }}>
                  {event.category.toUpperCase().replace('_', ' ')} // {event.severity}
                </div>
                <div className="text-white leading-relaxed mb-5 bg-white/[0.05] p-3 border-l-4 border-white/20 font-bold">
                  {event.description}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest bg-white/5 p-2 rounded-sm tabular-nums">
                    Confidence: <span className="text-white">{event.confidence}%</span> // {new Date(event.detectedAt).toLocaleTimeString()}
                  </div>
                  <Link 
                    href={`/country/${event.countryCode}`}
                    className="w-full bg-white text-black text-center py-3 font-black uppercase hover:bg-normal hover:text-black transition-all rounded-sm shadow-xl tracking-widest text-xs"
                  >
                    View Intel Report
                  </Link>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
