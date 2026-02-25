export async function fetchGreyNoiseThreats(countryCode: string) {
  try {
    // GreyNoise Community - No Key Required for basic queries
    // Vemos quantos IPs maliciosos foram vistos originados desse país
    const res = await fetch(`https://api.greynoise.io/v3/community/stats?gnql=last_seen:1d+country:${countryCode}`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      maliciousCount: data.total || 0,
      topTags: data.tags || []
    };
  } catch (error) {
    return null;
  }
}
