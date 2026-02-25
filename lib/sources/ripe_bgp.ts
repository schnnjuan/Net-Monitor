// Infrastructure Layer: RIPE Stat (BGP Routing)
// Goal: Detect Total Internet Isolation at the routing level

const RIPE_API_BASE = "https://stat.ripe.net/data";

/**
 * Checks BGP Prefix visibility for a country
 * Returns visibility percentage (0-100)
 */
export async function fetchBgpVisibility(countryCode: string): Promise<{ visibility: number, status: string }> {
  try {
    const res = await fetch(
      `${RIPE_API_BASE}/visibility/data.json?resource=${countryCode}`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) return { visibility: 100, status: 'stable' };
    const data = await res.json();
    
    // RIPE returns a list of prefix visibility
    // We average them to get a national score
    const prefixes = data.data?.visibility || [];
    if (prefixes.length === 0) return { visibility: 100, status: 'stable' };

    const avg = prefixes.reduce((acc: number, p: any) => acc + (p.visibility_score || 0), 0) / prefixes.length;
    
    return {
      visibility: Math.round(avg * 100) / 100,
      status: avg < 50 ? 'isolated' : avg < 90 ? 'degraded' : 'stable'
    };
  } catch (e) {
    return { visibility: 100, status: 'stable' };
  }
}

/**
 * Detects BGP Hijacks for a specific AS (Advanced feature)
 */
export async function checkBgpHijacks(resource: string) {
  try {
    const res = await fetch(`${RIPE_API_BASE}/bgp-hijacks/data.json?resource=${resource}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.hijacks || [];
  } catch(e) { return []; }
}
