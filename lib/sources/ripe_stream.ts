'use client'

import { useEffect, useState } from 'react'

export interface RipeEvent {
  id: number
  type: 'ping' | 'traceroute'
  src: { lat: number, lng: number }
  dst: { lat: number, lng: number }
  rtt: number
}

// RIPE Atlas Stream URL
const RIPE_WS_URL = 'wss://atlas-stream.ripe.net/stream/probes'

export function useRipeStream() {
  const [events, setEvents] = useState<RipeEvent[]>([])

  useEffect(() => {
    const ws = new WebSocket(RIPE_WS_URL)

    ws.onopen = () => {
      // Subscribe to all public measurements (probe connectivity)
      ws.send(JSON.stringify({
        type: "atlas_subscribe",
        stream_type: "status",
        format: "compact" // Dados menores para não travar
      }))
    }

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        if (data.event === "connect" || data.event === "disconnect") {
           // Simula coordenadas (RIPE não manda lat/lng no stream "status" público por privacidade exata)
           // Usamos uma aproximação baseada no ID para espalhar no mapa (visualização de atividade)
           const lat = (Math.random() * 160) - 80
           const lng = (Math.random() * 360) - 180
           
           const newEvent: RipeEvent = {
             id: data.prb_id,
             type: 'ping',
             src: { lat, lng },
             dst: { lat, lng },
             rtt: 0
           }

           setEvents(prev => [...prev.slice(-20), newEvent]) // Mantém apenas os últimos 20 para não pesar
        }
      } catch (e) {}
    }

    return () => ws.close()
  }, [])

  return events
}
