// Security Rep Layer: URLhaus + Local Heuristics
// Goal: Distinguish between "Censorship" and "Security/Malware Filtering"

const MALWARE_KEYWORDS = [
  'malware', 'phishing', 'virus', 'trojan', 'ransomware', 'crack', 'keygen', 
  'torrent-malware', 'botnet', 'spyware', 'steal-your-data'
];

/**
 * Checks if a URL or list of URLs are likely malicious
 * Returns a score 0-100 (0 = political/safe, 100 = definitely malware)
 */
export async function checkUrlReputation(urls: string[]): Promise<{ isMalicious: boolean, score: number }> {
  if (!urls || urls.length === 0) return { isMalicious: false, score: 0 };

  // 1. Local Heuristics (Instant)
  let localScore = 0;
  urls.forEach(url => {
    const lowerUrl = url.toLowerCase();
    if (MALWARE_KEYWORDS.some(kw => lowerUrl.includes(kw))) {
      localScore += 20;
    }
  });

  // 2. URLhaus Check (Real-time Cloud Intelligence)
  // We check the first few URLs to avoid rate limits
  try {
    const checkTarget = urls[0].replace(/^https?:\/\//, '').split('/')[0];
    const res = await fetch(`https://urlhaus-api.abuse.ch/v1/host/${checkTarget}`, {
      method: 'POST',
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.query_status === 'ok' && data.malware_url_count > 0) {
        return { isMalicious: true, score: 95 };
      }
    }
  } catch (e) {
    // Fallback to local
  }

  return { 
    isMalicious: localScore > 40, 
    score: Math.min(100, localScore) 
  };
}
