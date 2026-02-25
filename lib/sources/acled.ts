// Geopolitical Layer: ACLED (Conflict/Protests)
// Goal: Correlate Kinetic events with digital shutdowns

const ACLED_API_URL = "https://api.acleddata.com/acled/read.json";

export interface PoliticalEvent {
  country: string;
  countryCode: string;
  type: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  date: string;
}

/**
 * Fetches recent protests/conflicts to contextualize shutdowns
 * Requires ACLED_API_EMAIL and ACLED_API_KEY for full access
 * For now, using a fallback or mock logic to prevent empty state
 */
export async function fetchPoliticalEvents(countryCode?: string): Promise<PoliticalEvent[]> {
  const email = process.env.ACLED_API_EMAIL;
  const key = process.env.ACLED_API_KEY;

  if (!email || !key) {
    console.warn("ACLED API keys not set. Political context will be limited.");
    return [];
  }

  try {
    const query = countryCode ? `&iso=${countryCode}` : "&limit=50";
    const res = await fetch(`${ACLED_API_URL}?email=${email}&key=${key}${query}&limit=20`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    
    return (data.data || []).map((ev: any) => ({
      country: ev.country,
      countryCode: ev.iso,
      type: ev.event_type,
      description: ev.notes,
      severity: ev.fatalities > 10 ? 'critical' : ev.fatalities > 0 ? 'high' : 'moderate',
      date: ev.event_date
    }));
  } catch (e) {
    return [];
  }
}
