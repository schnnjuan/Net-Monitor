import { fetchIodaOutages } from "./sources/ioda";
import { fetchOoniCensorship } from "./sources/ooni";
import { fetchNetblocksAlerts } from "./sources/netblocks";
import { fetchThermalAnomalies } from "./sources/nasa_firms";
import { fetchCloudflareOutages } from "./sources/cloudflare";
import { fetchBgpVisibility } from "./sources/ripe_bgp";
import { fetchKineticEvents } from "./sources/gdelt_events";
import { checkUrlReputation } from "./sources/urlhaus";
import { fetchDShieldThreats } from "./sources/dshield";
import { fetchCountryPerformance } from "./sources/mlab";
import { NetworkEvent } from "./types";
import countriesData from "../data/countries.json";

export async function getActiveEvents(): Promise<NetworkEvent[]> {
  // 1. Ingestão de TODAS as fontes em paralelo
  const [ioda, ooni, netblocks, cfOutages, kinetic, dshield] = await Promise.allSettled([
    fetchIodaOutages(),
    fetchOoniCensorship(),
    fetchNetblocksAlerts(),
    fetchCloudflareOutages(),
    fetchKineticEvents(),
    fetchDShieldThreats()
  ]);

  const baseEvents: NetworkEvent[] = [];

  // Helper para adicionar eventos com segurança
  const addEvents = (res: PromiseSettledResult<any[]>) => {
    if (res.status === 'fulfilled') baseEvents.push(...res.value);
  };

  addEvents(ioda);
  addEvents(ooni);
  
  // Adiciona eventos de Ameaça Cibernética (DShield)
  if (dshield.status === 'fulfilled') {
    dshield.value.slice(0, 10).forEach((att: any) => {
      const geo = countriesData.find(c => c.code === att.countryCode);
      if (geo) {
        baseEvents.push({
          id: `dshield-${att.countryCode}-${Date.now()}`,
          countryCode: att.countryCode,
          countryName: geo.name,
          category: 'attack',
          severity: att.count > 1000000 ? 'critical' : 'high',
          confidence: 90,
          title: `Malicious Traffic Source: ${geo.name}`,
          description: `Originando alto volume de scans maliciosos detectados pelo DShield.`,
          detectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sources: ['DShield' as any],
          lat: geo.lat,
          lng: geo.lng
        });
      }
    });
  }

  // Adiciona eventos Políticos (GDELT Kinetic Events)
  if (kinetic.status === 'fulfilled') {
    kinetic.value.forEach((ev: any) => {
      const geo = countriesData.find(c => c.code === ev.countryCode);
      if (geo) {
        baseEvents.push({
          ...(ev as NetworkEvent),
          countryName: geo.name,
          lat: geo.lat,
          lng: geo.lng,
          updatedAt: new Date().toISOString()
        });
      }
    });
  }

  // Adiciona Cloudflare como fonte primária
  if (cfOutages.status === 'fulfilled') {
    cfOutages.value.forEach((out: any) => {
      const location = out.locationCode || out.location || out.locations?.[0];
      const geo = countriesData.find(c => c.code === location);
      if (geo) {
        baseEvents.push({
          id: `cf-${out.id}`,
          countryCode: location,
          countryName: geo.name,
          category: 'shutdown',
          severity: 'critical',
          confidence: 98,
          title: `Cloudflare Verified: ${geo.name}`,
          description: `Cloudflare Radar detectou anomalia crítica de tráfego.`,
          detectedAt: out.startDate || out.start_time,
          updatedAt: new Date().toISOString(),
          sources: ['Cloudflare'],
          lat: geo.lat,
          lng: geo.lng
        });
      }
    });
  }

  const countryMap = new Map<string, NetworkEvent>();

  for (const event of baseEvents) {
    const existing = countryMap.get(event.countryCode);
    if (existing) {
      // Cruzamento real: Se mais de uma fonte confirma, confidence sobe
      existing.confidence = Math.min(99, existing.confidence + 15);
      if (!existing.sources.includes(event.sources[0])) {
        existing.sources.push(event.sources[0]);
      }
      // Prioriza 'shutdown' como categoria dominante
      if (event.category === 'shutdown') existing.category = 'shutdown';
    } else {
      const geo = countriesData.find(c => c.code === event.countryCode);
      if (geo) {
        countryMap.set(event.countryCode, { ...event, countryName: geo.name, lat: geo.lat, lng: geo.lng });
      }
    }
  }

  // 2. Correlação avançada: NASA, NetBlocks, BGP e Reputação
  for (const event of countryMap.values()) {
    // A. Filtro de Sanidade (Censura vs Segurança)
    if (event.category === 'censorship' && event.targets) {
      try {
        const rep = await checkUrlReputation(event.targets);
        if (rep.isMalicious) {
          event.category = 'security_filter';
          event.title = `Safety Filter: ${event.countryCode}`;
          event.description = `Sites bloqueados por segurança/malware (Score: ${rep.score}).`;
          event.severity = 'low';
        }
      } catch (e) {}
    }

    // B. Visibilidade BGP (RIPE)
    try {
      const bgp = await fetchBgpVisibility(event.countryCode);
      if (bgp.visibility < 95) {
        event.sources.push('RIPE');
        event.description += ` | BGP Visibility: ${bgp.visibility}% (Routing Anomaly).`;
        if (bgp.visibility < 50) {
          event.category = 'shutdown';
          event.severity = 'critical';
        }
        event.confidence = Math.min(99, event.confidence + 10);
      }
    } catch(e) {}

    // C. Busca fogo/calor da NASA
    try {
      const thermal = await fetchThermalAnomalies(event.countryCode);
      if (thermal.length > 5) {
        event.sources.push('NASA');
        event.description += ` | Detectados ${thermal.length} focos de calor (NASA).`;
        event.confidence = Math.min(99, event.confidence + 5);
      }
    } catch(e) {}

    // D. Busca contexto NetBlocks
    if (netblocks.status === 'fulfilled') {
      const news = netblocks.value.find(n => n.title?.includes(event.countryName));
      if (news) {
        event.sources.push('NetBlocks');
        event.confidence = 99;
      }
    }

    // E. Detecção de Throttling (M-Lab/Performance)
    try {
      const perf = await fetchCountryPerformance(event.countryCode);
      if (perf.download < 15) { // Queda de performance significativa
        event.category = 'throttling';
        event.description += ` | Rede Degradada: ${perf.download.toFixed(1)} Mbps detectados (Throttling provável).`;
        event.confidence = Math.min(99, event.confidence + 10);
      }
    } catch(e) {}
  }

  return Array.from(countryMap.values()).sort((a, b) => b.confidence - a.confidence);
}
