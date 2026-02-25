import { NetworkEvent, SignalData } from "../types";

const IODA_API_BASE = "https://api.ioda.caida.org/v2";

export async function fetchIodaCountrySignals(countryCode: string) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86400;

    // Busca sinais de BGP e Active Probing das últimas 24h
    const res = await fetch(
      `${IODA_API_BASE}/signals/raw/country/${countryCode}?from=${dayAgo}&until=${now}&datasource=bgp`,
      { 
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(8000) // Timeout de 8s para não travar
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    
    // Simplifica para o gráfico: [{ time: "HH:mm", value: N }]
    return data.data?.[0]?.values?.map((v: any) => ({
      time: new Date(v[0] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.round(v[1] * 100) / 100
    })) || [];
  } catch (error) {
    console.warn(`IODA fetch error for ${countryCode}:`, error);
    return [];
  }
}

export async function fetchIodaOutages(): Promise<NetworkEvent[]> {
  try {
    // Busca outages ativos nos últimos 30 minutos
    const now = Math.floor(Date.now() / 1000);
    const thirtyMinutesAgo = now - 1800;

    const res = await fetch(
      `${IODA_API_BASE}/outages/country?from=${thirtyMinutesAgo}&until=${now}&limit=50`,
      { 
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000) // Timeout de 10s
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    
    // IODA retorna uma lista de outages por país
    // Precisamos mapear para o nosso formato NetworkEvent
    return (data || []).map((outage: any): NetworkEvent => {
      const severity = outage.score > 80 ? 'critical' : outage.score > 50 ? 'high' : 'medium';
      
      return {
        id: `ioda-${outage.country_code}-${outage.start_time}`,
        countryCode: outage.country_code,
        countryName: outage.country_name || outage.country_code,
        category: 'shutdown',
        severity,
        confidence: Math.round(outage.score),
        title: `Outage Detectado: ${outage.country_name}`,
        description: `Queda de tráfego detectada via IODA (Score: ${outage.score}).`,
        detectedAt: new Date(outage.start_time * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        sources: ['IODA'],
        lat: 0, // Será preenchido pelo agregador usando country data
        lng: 0,
      };
    });
  } catch (error) {
    console.error("Failed to fetch IODA data:", error);
    return [];
  }
}
