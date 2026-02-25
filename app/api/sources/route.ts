import { NextResponse } from "next/server";
import { SourceHealth } from "@/lib/types";

const PROBE_TIMEOUT = 5000;

async function probeSource(name: string, url: string): Promise<SourceHealth> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
    
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 60 } });
    clearTimeout(timeoutId);
    
    const latency = Date.now() - start;
    
    return {
      id: name as any,
      name,
      status: res.ok ? 'online' : 'degraded',
      latency,
      lastUpdate: new Date().toISOString(),
      message: res.statusText
    };
  } catch (err: any) {
    return {
      id: name as any,
      name,
      status: 'offline',
      latency: Date.now() - start,
      lastUpdate: new Date().toISOString(),
      message: err.message || "Timeout or Connection Refused"
    };
  }
}

export async function GET() {
  const sources = await Promise.all([
    probeSource("IODA", "https://api.ioda.caida.org/v2/entities/query?entityType=country&limit=1"),
    probeSource("OONI", "https://api.ooni.io/api/v1/measurements?limit=1"),
    probeSource("NetBlocks", "https://netblocks.org/feed"),
    probeSource("SANS ISC", "https://isc.sans.edu/api/infocon?json"),
    probeSource("BGPView", "https://api.bgpview.io/asn/13335")
  ]);

  // Busca o nível de ameaça global (SANS ISC)
  const resThreat = await fetch("https://isc.sans.edu/api/infocon?json", { 
    headers: { 'User-Agent': 'NetMonitor/1.0' },
    next: { revalidate: 300 } 
  });
  const threatData = await resThreat.json();

  return NextResponse.json({
    sources,
    globalThreat: threatData.status || 'green',
    generatedAt: new Date().toISOString(),
    totalActive: sources.filter(s => s.status === 'online').length
  });
}
