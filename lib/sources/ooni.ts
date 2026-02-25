import { NetworkEvent } from "../types";

const OONI_API_BASE = "https://api.ooni.io/api/v1";

export async function fetchOoniCensorship(): Promise<NetworkEvent[]> {
  try {
    // Busca medições confirmadas de hoje
    const today = new Date().toISOString().split('T')[0];
    
    // OONI aggregation para ver onde há bloqueios confirmados agora
    // Focamos em web_connectivity (sites) e whatsapp/signal/tor
    const res = await fetch(
      `${OONI_API_BASE}/measurements?confirmed=true&limit=500&since=${today}`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) throw new Error(`OONI API error: ${res.status}`);

    const data = await res.json();
    
    // Agrupar por país para não inundar o dashboard
    const countryGroups: Record<string, any> = {};

    data.results.forEach((m: any) => {
      if (!countryGroups[m.probe_cc]) {
        countryGroups[m.probe_cc] = {
          count: 0,
          targets: new Set<string>(),
          testTypes: new Set<string>(),
          lastSeen: m.measurement_start_time
        };
      }
      countryGroups[m.probe_cc].count++;
      
      // Captura o alvo (URL ou nome do teste de App)
      const target = m.input || m.test_name.replace('_', ' ');
      if (target) countryGroups[m.probe_cc].targets.add(target);
      countryGroups[m.probe_cc].testTypes.add(m.test_name);
    });

    return Object.entries(countryGroups).map(([cc, info]: [string, any]): NetworkEvent => {
      const allTargets = Array.from(info.targets) as string[];
      const displayTargets = allTargets.slice(0, 3).join(', ');
      const moreCount = allTargets.length > 3 ? ` (+${allTargets.length - 3} outros)` : '';
      
      return {
        id: `ooni-${cc}-${today}`,
        countryCode: cc,
        countryName: cc,
        category: 'censorship',
        severity: info.count > 10 ? 'critical' : 'high',
        confidence: Math.min(95, 60 + (info.count * 5)),
        title: `Bloqueios Confirmados em ${cc}`,
        description: `Confirmada interferência em: ${displayTargets}${moreCount}.`,
        detectedAt: info.lastSeen,
        updatedAt: new Date().toISOString(),
        sources: ['OONI'],
        lat: 0,
        lng: 0,
        targets: allTargets
      };
    });
  } catch (error) {
    console.error("Failed to fetch OONI data:", error);
    return [];
  }
}
