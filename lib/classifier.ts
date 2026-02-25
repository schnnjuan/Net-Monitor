import Groq from "groq-sdk";
import redis from "./redis";
import { NetworkEvent } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AI_REPORT_CACHE_KEY = "netmonitor:ai:global_report";
const AI_REPORT_TTL = 10800; // 3h (em segundos) para ser conservador

export interface AIReport {
  summary: string;
  criticalZones: string[];
  threatLevel: 'low' | 'moderate' | 'high' | 'critical';
  timestamp: string;
}

export async function generateGlobalIntelligence(events: NetworkEvent[], globalThreat: string): Promise<AIReport> {
  const fallbackReport: AIReport = {
    summary: "Aguardando próxima janela de sincronização da rede neural (Ciclos de 1h30m). O sistema está monitorando sinais técnicos de IODA e OONI em tempo real.",
    criticalZones: ["Vigilância Ativa"],
    threatLevel: 'low',
    timestamp: new Date().toISOString(),
  };

  // 1. Tentar buscar o relatório cacheado no Redis
  if (redis) {
    try {
      const cached = await redis.get(AI_REPORT_CACHE_KEY);
      if (cached) return cached as AIReport;
    } catch (e) {
      console.error("Redis Read Error (AI):", e);
    }
  }

  // 2. Se não houver cache e não tivermos chave de API, retornamos o fallback amigável
  if (!process.env.GROQ_API_KEY) return fallbackReport;

  // 3. Se houver muitos eventos novos ou cache expirou, chamamos a IA
  const eventSummary = events.slice(0, 15).map(e => {
    const targetsInfo = e.targets ? ` | Targets: ${e.targets.slice(0, 5).join(', ')}` : '';
    return `- ${e.countryName}: ${e.category.toUpperCase()} | ${e.description}${targetsInfo}`;
  }).join('\n');

  const prompt = `
    You are a Senior Strategic Network Intelligence Analyst.
    Analyze these signals:
    THREAT: ${globalThreat}
    EVENTS:
    ${events.length > 0 ? eventSummary : "System nominal."}

    RESPONSE JSON:
    {
      "summary": "2 sentences of high-density analysis.",
      "criticalZones": ["Zone 1: Why", "Zone 2: Why"],
      "threatLevel": "low|moderate|high|critical"
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const aiContent = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    const report: AIReport = {
      summary: aiContent.summary || fallbackReport.summary,
      criticalZones: aiContent.criticalZones || fallbackReport.criticalZones,
      threatLevel: aiContent.threatLevel || 'low',
      timestamp: new Date().toISOString(),
    };

    // 4. Salvar no Redis por 3h
    if (redis) {
      await redis.set(AI_REPORT_CACHE_KEY, JSON.stringify(report), { ex: AI_REPORT_TTL });
    }

    return report;
  } catch (error) {
    console.error("AI Generation Error (Rate Limit?):", error);
    // IMPORTANTE: Se falhar (rate limit), tentamos retornar o cache mesmo que expirado
    // (A implementação do Redis 'get' acima já cuidaria se ainda estivesse lá)
    return fallbackReport;
  }
}
