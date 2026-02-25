'use client'

import { CircleMarker } from 'react-leaflet'
import { useRipeStream } from '@/lib/sources/ripe_stream'

export default function LivePulseLayer() {
  const events = useRipeStream()

  return (
    <>
      {events.map((ev, i) => (
        <CircleMarker
          key={`${ev.id}-${i}`}
          center={[ev.src.lat, ev.src.lng]}
          radius={2}
          pathOptions={{
            color: '#00ff9d',
            fillColor: '#00ff9d',
            fillOpacity: 0.8,
            opacity: 0.8,
            weight: 0,
            className: 'animate-ping-slow' // Usaremos CSS para fade out
          }}
        />
      ))}
    </>
  )
}
