// Core types for Net Monitor - STRICT adherence to real data sources

export type EventCategory = 
  | 'shutdown'        // Total outage (IODA, BGP)
  | 'attack'          // DDoS, Cyberattack (Cloudflare, DShield)
  | 'censorship'      // Blocked sites/apps (OONI)
  | 'throttling'      // Traffic degradation (Cloudflare, M-Lab)
  | 'security_filter'  // Blocked for safety (Malware, Phishing)
  | 'conflict'        // Kinetic conflict/protests (ACLED)
  | 'technical'       // Cable cut, maintenance (non-political)
  | 'unknown'         // Anomaly detected but unclassified
  | 'normal';         // Monitoring active, no issues

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DataSource = 
  | 'IODA' 
  | 'OONI' 
  | 'Cloudflare' 
  | 'BGPView' 
  | 'RIPE' 
  | 'NetBlocks' 
  | 'GDELT' 
  | 'ACLED' 
  | 'AccessNow'
  | 'NASA'
  | 'DShield'
  | 'GreyNoise';

export interface NetworkEvent {
  id: string;              // Unique ID (e.g., "IR-shutdown-20240224")
  countryCode: string;     // ISO 3166-1 alpha-2 (e.g., "IR")
  countryName: string;     // e.g., "Iran"
  category: EventCategory;
  severity: EventSeverity;
  confidence: number;      // 0-100 (calculated by classifier)
  title: string;           // Brief, factual title
  description: string;     // One sentence technical summary
  detectedAt: string;      // ISO timestamp of first detection
  updatedAt: string;       // ISO timestamp of last update
  sources: DataSource[];   // Sources that confirmed this event
  lat: number;             // GeoJSON latitude
  lng: number;             // GeoJSON longitude
  targets?: string[];      // Full list of blocked targets (for censorship)
  articles?: GdeltArticle[]; // Full list of related news
}

export interface SignalData {
  source: DataSource;
  value: number;           // Normalized 0-100 or raw count
  timestamp: string;
  meta?: Record<string, any>; // Extra context (e.g., "asn": 12345)
}

// Detailed Country View
export interface CountryStatus {
  code: string;
  name: string;
  region: string;
  activeEvents: NetworkEvent[];
  monitoringStatus: 'active' | 'partial' | 'inactive';
  lastChecked: string;
  
  // Contextual Data
  freedomScore?: number;        // Freedom House (0-100)
  internetPenetration?: number; // % of population
  mainISPs?: string[];          // Top ASNs
}

// Source Health
export interface SourceHealth {
  id: DataSource;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;         // ms
  lastUpdate: string;      // timestamp of last successful fetch
  message?: string;        // Error message if offline
}

export interface GdeltArticle {
  url: string;
  title: string;
  source: string;
  publishedAt: string;
  language: string;
}

export interface OoniMeasurement {
  url: string;
  category: string;
  status: 'blocked' | 'accessible' | 'anomaly';
  confirmed: boolean;
  timestamp: string;
}
