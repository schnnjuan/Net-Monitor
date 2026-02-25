import { GdeltArticle } from "../types";

export async function fetchGdeltNews(countryName: string, countryCode: string): Promise<GdeltArticle[]> {
  const tryQuery = async (q: string, span: string = "24h") => {
    try {
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=artlist&maxrecords=100&format=json&timespan=${span}&sort=hybridrel`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      
      if (!res.ok) return [];
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return [];
      }

      const data = await res.json();
      return data.articles || [];
    } catch (e) {
      return [];
    }
  };

  try {
    // TENTATIVA 1: Busca específica por Liberdade Digital
    let articles = await tryQuery(`"${countryName}" (internet OR shutdown OR censorship OR "social media")`);

    // TENTATIVA 2: Se vazio, busca por Instabilidade Geral (Protestos, Conflitos)
    if (articles.length === 0) {
      articles = await tryQuery(`"${countryName}" (protest OR conflict OR election OR crisis OR "security forces")`);
    }

    // TENTATIVA 3: Se ainda vazio, busca Top News do país (Qualquer assunto)
    if (articles.length === 0) {
      articles = await tryQuery(`"${countryName}"`, "12h");
    }

    return articles.map((art: any) => ({
      url: art.url,
      title: art.title,
      source: art.sourcecountry || art.domain || "Global Source",
      publishedAt: art.seendate,
      language: art.language || "en"
    }));
  } catch (error) {
    console.error(`GDELT persistent fetch error for ${countryName}:`, error);
    return [];
  }
}
