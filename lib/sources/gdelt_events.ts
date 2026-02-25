// Geopolitical Layer: GDELT Events (No Key Required)
// Goal: Detect Protests, Conflicts and Riots using GDELT Themes

import { NetworkEvent } from "../types";

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";

/**
 * Fetches kinetic events (protests, conflicts) from GDELT themes
 */
export async function fetchKineticEvents(): Promise<Partial<NetworkEvent>[]> {
  try {
    // Buscamos eventos globais com temas de alta intensidade nas últimas 24h
    // Temas: PROTEST, ARMEDCONF (Conflito Armado), CIVIL_UNREST_RIOTS
    const query = `(theme:PROTEST OR theme:ARMEDCONF OR theme:CIVIL_UNREST_RIOTS) (tone < -5)`;
    const url = `${GDELT_DOC_API}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=50&format=json&timespan=24h&sort=hybridrel`;

    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];

    const data = await res.json();
    const articles = data.articles || [];

    // Agrupar por país para criar eventos de "Conflito"
    const countryEvents: Record<string, any> = {};

    articles.forEach((art: any) => {
      const cc = art.sourcecountry; // GDELT fornece o código do país da fonte ou local mencionado
      if (!cc || cc === 'US') return; // Ignorar US se não for o foco

      if (!countryEvents[cc]) {
        countryEvents[cc] = {
          count: 0,
          title: art.title,
          description: '',
          date: art.seendate
        };
      }
      countryEvents[cc].count++;
    });

    return Object.entries(countryEvents).map(([cc, info]) => ({
      id: `gdelt-conflict-${cc}-${Date.now()}`,
      countryCode: cc,
      category: 'conflict' as any,
      severity: info.count > 10 ? 'critical' : 'high',
      confidence: 75,
      title: `Political Instability Detected: ${cc}`,
      description: `High volume of conflict/protest reports detected in international media.`,
      detectedAt: new Date(info.date).toISOString(),
      sources: ['GDELT' as any]
    }));
  } catch (e) {
    return [];
  }
}
