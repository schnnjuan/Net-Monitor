// Performance Layer: M-Lab (Internet Throttling)
// Goal: Detect intentional speed reduction (Throttling)

export interface PerformanceStats {
  download: number; // Mbps
  upload: number; // Mbps
  latency: number; // ms
  loss: number; // %
}

/**
 * M-Lab doesn't have a direct "current speed by country" REST API (uses BigQuery)
 * We simulate a performance check by sampling RIPE Atlas or similar aggregated views
 * In a real-world scenario, we'd query M-Lab's public datasets
 */
export async function fetchCountryPerformance(countryCode: string): Promise<PerformanceStats> {
  try {
    // Simulando consulta a sensor de performance (RIPE Atlas / M-Lab Aggregated)
    // Usamos um valor base de performance de 100 Mbps e aplicamos degradação via Cloudflare Netflow
    const res = await fetch(`https://api.cloudflare.com/client/v4/radar/netflows/timeseries?location=${countryCode}&dateRange=1d`, {
      headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}` },
      next: { revalidate: 3600 }
    });

    if (!res.ok) return { download: 50, upload: 20, latency: 45, loss: 0 };
    const data = await res.json();
    
    // Se o tráfego caiu mas não sumiu, calculamos a queda de "saúde" da rede
    const series = data.result?.series?.main || [];
    if (series.length < 2) return { download: 50, upload: 20, latency: 45, loss: 0 };

    const current = series[series.length - 1].value;
    const avg = series.reduce((acc: number, v: any) => acc + parseFloat(v.value), 0) / series.length;
    
    const health = Math.min(100, (current / avg) * 100);

    return {
      download: 50 * (health / 100), // Performance afetada pela queda de tráfego
      upload: 20 * (health / 100),
      latency: 45 * (2 - (health / 100)), // Latência sobe quando a rede degrada
      loss: health < 50 ? (50 - health) / 2 : 0
    };
  } catch (e) {
    return { download: 50, upload: 20, latency: 45, loss: 0 };
  }
}
