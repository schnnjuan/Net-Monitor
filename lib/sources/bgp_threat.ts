import { XMLParser } from "fast-xml-parser";

export interface ThreatLevel {
  status: 'green' | 'yellow' | 'orange' | 'red';
  updatedAt: string;
}

export async function fetchGlobalThreatLevel(): Promise<ThreatLevel> {
  try {
    // SANS ISC API - No Key Required
    // Exige apenas um User-Agent identificável
    const res = await fetch("https://isc.sans.edu/api/infocon?json", {
      headers: { 'User-Agent': 'NetMonitor/1.0 (Contact: admin@netmonitor.local)' },
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error("SANS ISC unreachable");
    const data = await res.json();

    return {
      status: data.status || 'green',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("DShield fetch error:", error);
    return { status: 'green', updatedAt: new Date().toISOString() };
  }
}

export async function fetchBgpStatus(asn: string = "13335") {
  try {
    // BGPView - No Key Required
    const res = await fetch(`https://api.bgpview.io/asn/${asn}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}
