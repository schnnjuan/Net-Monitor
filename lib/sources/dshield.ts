// Cyber Threat Layer: DShield (SANS Institute)
// Goal: Identify top sources of malicious scanning activity

const DSHIELD_API_URL = "https://dshield.org/api/topcountries/json";

export async function fetchDShieldThreats() {
  try {
    const res = await fetch(DSHIELD_API_URL, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    
    // Retorna os top países gerando ataques
    return data.map((item: any) => ({
      countryCode: item.country,
      count: item.count,
      rank: item.rank
    }));
  } catch (e) {
    return [];
  }
}
