import { NextResponse } from "next/server";
import { getActiveEvents } from "@/lib/aggregator";
import { generateGlobalIntelligence } from "@/lib/classifier";
import { saveDailySnapshot } from "@/lib/history";
import redis from "@/lib/redis";
import countriesData from "@/data/countries.json";

export const dynamic = "force-dynamic";

const CACHE_KEY = "netmonitor:events:global";
const CACHE_TTL = 300; // 5 minutos

export async function GET() {
  try {
    // 1. Tentar buscar do Cache Redis
    if (redis) {
      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        return NextResponse.json({
          ...(cachedData as object),
          fromCache: true,
        });
      }
    }

    // 2. Cache Miss: Buscar dados reais (pode levar 10s+)
    const events = await getActiveEvents();

    // Log to history (background)
    if (events.length >= 0) {
      saveDailySnapshot(events).catch(e => console.error("History log failed:", e));
    }

    // Busca o nível de ameaça global (SANS ISC)
    let globalThreat = 'green';
    try {
      const resThreat = await fetch("https://isc.sans.edu/api/infocon?json", {
        headers: { 'User-Agent': 'NetMonitor/1.0' },
        next: { revalidate: 300 }
      });
      const threatData = await resThreat.json();
      globalThreat = threatData.status || 'green';
    } catch (e) {
      console.error("SANS ISC fetch failed for route:", e);
    }

    // 3. Gerar Inteligência AI (com cache próprio de 1h30m dentro do classifier)
    const intelligence = await generateGlobalIntelligence(events, globalThreat);

    const summary = {
      shutdowns: events.filter(e => e.category === 'shutdown').length,
      attacks: events.filter(e => e.category === 'attack' || e.category === 'security_filter').length,
      countries: countriesData.length,
      sources: 10,
      activeSources: ["IODA", "OONI", "NetBlocks", "Cloudflare", "NASA", "RIPE", "GDELT GKG", "URLhaus", "GreyNoise", "SANS ISC"].length
    };

    const responseData = {
      events,
      intelligence,
      globalThreat,
      summary,
      generatedAt: new Date().toISOString(),
      sourcesPolled: ["IODA", "OONI", "NetBlocks", "Cloudflare", "NASA", "RIPE", "GDELT GKG", "URLhaus", "GreyNoise", "SANS ISC", "Llama-3.1-70B"],
    };

    // 4. Salvar no Redis apenas se houver dados reais (Evita cachear o 'OFF')
    if (redis && events.length > 0) {
      await redis.set(CACHE_KEY, JSON.stringify(responseData), { ex: CACHE_TTL });
    }

    return NextResponse.json({
      ...responseData,
      fromCache: false,
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events from uplink" },
      { status: 500 }
    );
  }
}
