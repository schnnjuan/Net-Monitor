import { XMLParser } from "fast-xml-parser";
import { NetworkEvent } from "../types";

const NETBLOCKS_FEED_URL = "https://netblocks.org/feed";

export async function fetchNetblocksAlerts(): Promise<Partial<NetworkEvent>[]> {
  try {
    const res = await fetch(NETBLOCKS_FEED_URL, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error("Failed to fetch NetBlocks feed");
    
    const xmlData = await res.text();
    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);
    
    const items = jsonObj.rss?.channel?.item || [];
    const alerts = Array.isArray(items) ? items : [items];

    return alerts.map((item: any) => {
      // Tenta extrair o país do título (Ex: "Internet disrupted in Gabon...")
      // Em uma versão real, usaríamos NLP ou uma lista de países. 
      // Para o MVP, retornamos o título e descrição para cruzamento de texto.
      return {
        id: `netblocks-${item.guid || item.link}`,
        title: item.title,
        description: item.description?.replace(/<[^>]*>?/gm, '').slice(0, 150) + "...",
        detectedAt: new Date(item.pubDate).toISOString(),
        sources: ['NetBlocks' as any],
        // O país será associado no aggregator via busca de texto
      };
    });
  } catch (error) {
    console.error("NetBlocks fetch error:", error);
    return [];
  }
}
