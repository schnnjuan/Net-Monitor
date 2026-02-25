export interface ThermalAnomaly {
  latitude: number;
  longitude: number;
  brightness: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: number;
}

const FIRMS_API_BASE = "https://firms.modaps.eosdis.nasa.gov/api/countries/csv";

export async function fetchThermalAnomalies(countryCode: string): Promise<ThermalAnomaly[]> {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;
  if (!mapKey) {
    console.warn("NASA_FIRMS_MAP_KEY not set. Thermal anomalies will be unavailable.");
    return [];
  }

  try {
    // Busca focos de calor nas últimas 24h para o país
    const res = await fetch(
      `${FIRMS_API_BASE}/${mapKey}/VIIRS_SNPP/${countryCode}/1`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const csvText = await res.text();
    const rows = csvText.split('\n').slice(1); // Remove header

    return rows
      .filter(row => row.trim().length > 0)
      .map(row => {
        const parts = row.split(',');
        return {
          latitude: parseFloat(parts[1]),
          longitude: parseFloat(parts[2]),
          brightness: parseFloat(parts[3]),
          acq_date: parts[4],
          acq_time: parts[5],
          satellite: parts[6],
          confidence: parseInt(parts[7])
        };
      });
  } catch (error) {
    console.error("Failed to fetch NASA FIRMS data:", error);
    return [];
  }
}
