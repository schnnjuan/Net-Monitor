import { NextResponse } from "next/server";
import { fetchIodaCountrySignals } from "@/lib/sources/ioda";
import { fetchOoniCensorship } from "@/lib/sources/ooni";
import { fetchThermalAnomalies } from "@/lib/sources/nasa_firms";
import { fetchCloudflareAttacks, fetchCloudflareNetflow } from "@/lib/sources/cloudflare";
import { fetchGreyNoiseThreats } from "@/lib/sources/greynoise";
import { fetchGdeltNews } from "@/lib/sources/gdelt";
import countriesData from "@/data/countries.json";
import redis from "@/lib/redis";

export const dynamic = "force-dynamic";

const COUNTRY_CACHE_PREFIX = "netmonitor:country:";
const COUNTRY_CACHE_TTL = 600; // 10 minutos

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const country = countriesData.find(c => c.code === code);

  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }

  try {
    // 1. Verificar Cache Redis
    const cacheKey = `${COUNTRY_CACHE_PREFIX}${code}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...(cached as object),
          fromCache: true
        });
      }
    }

    // 2. Cache Miss: Buscar dados reais (TODAS AS FONTES)
    const [signals, ooni, thermal, security, cfAttacks, news, cfNetflow] = await Promise.all([
      fetchIodaCountrySignals(code),
      fetchOoniCensorship(),
      fetchThermalAnomalies(code),
      fetchGreyNoiseThreats(code),
      fetchCloudflareAttacks(code),
      fetchGdeltNews(country.name, code),
      fetchCloudflareNetflow(code)
    ]);

    const countryEvents = ooni.filter(e => e.countryCode === code);

    const responseData = {
      country: {
        ...country,
        lastUpdate: new Date().toISOString(),
      },
      signals,
      cfNetflow, // Tráfego real do Radar
      ooni: countryEvents,
      news: news,
      satellite: {
        thermalEvents: thermal.length,
        thermalAnomalies: thermal, // Todos os focos de calor
      },
      cyberSecurity: {
        attackingIPs: security?.maliciousCount || 0,
        tags: security?.topTags || [],
        ddosRisk: cfAttacks?.isUnderAttack ? 'HIGH' : 'STABLE'
      },
      historical: {
        score: (country as any).history || 0,
        freedomStatus: (country as any).freedom || "Unknown",
      },
      submarineCables: ((country as any).cables || []).map((name: string) => ({
        name,
        status: "online"
      }))
    };

    // 3. Salvar no Redis
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(responseData), { ex: COUNTRY_CACHE_TTL });
    }

    return NextResponse.json({
      ...responseData,
      fromCache: false
    });
  } catch (error) {
    console.error(`Error fetching country ${code}:`, error);
    return NextResponse.json({ error: "Data fetch failed" }, { status: 500 });
  }
}
