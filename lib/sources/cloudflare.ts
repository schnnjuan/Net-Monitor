export async function fetchCloudflareNetflow(countryCode: string) {
  const token = process.env.CLOUDFLARE_TOKEN;
  if (!token) return [];

  try {
    const url = `https://api.cloudflare.com/client/v4/radar/netflows/timeseries?location=${countryCode}&dateRange=1d`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 1800 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.result?.series?.main?.map((v: any) => ({
      time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(v.value)
    })) || [];
  } catch (error) {
    return [];
  }
}

export async function fetchCloudflareAttacks(countryCode: string) {
  const token = process.env.CLOUDFLARE_TOKEN;
  if (!token) return null;

  try {
    // Busca o volume de ataques DDoS L7 nas últimas 24h
    const url = `https://api.cloudflare.com/client/v4/radar/attacks/layer7/timeseries?location=${countryCode}&dateRange=1d`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 1800 }
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    // Calcula se há um pico de ataques agora (comparando o último ponto com a média)
    const series = data.result?.series?.main || [];
    if (series.length === 0) return null;
    
    const lastValue = parseFloat(series[series.length - 1].value);
    const avgValue = series.reduce((acc: number, v: any) => acc + parseFloat(v.value), 0) / series.length;

    return {
      isUnderAttack: lastValue > avgValue * 2, // Pico de 2x a média
      attackVolume: lastValue,
      recentSeries: series.slice(-10)
    };
  } catch (error) {
    return null;
  }
}

export async function fetchCloudflareOutages() {
  const token = process.env.CLOUDFLARE_TOKEN;
  if (!token) return [];

  try {
    // Busca outages documentados pela Cloudflare nos últimos 7 dias
    const url = `https://api.cloudflare.com/client/v4/radar/outages?dateRange=7d&limit=10`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.result?.outages || data.result?.annotations || [];
  } catch (error) {
    return [];
  }
}
