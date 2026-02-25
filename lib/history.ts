import redis from "./redis";
import { NetworkEvent } from "./types";

const HISTORY_KEY_PREFIX = "netmonitor:history:";
const HISTORY_RETENTION_DAYS = 30;

export interface DailySnapshot {
  date: string;
  totalEvents: number;
  shutdowns: number;
  censorship: number;
  averageConfidence: number;
}

export async function saveDailySnapshot(events: NetworkEvent[]) {
  if (!redis) return;

  const today = new Date().toISOString().split('T')[0];
  const key = `${HISTORY_KEY_PREFIX}${today}`;

  const snapshot: DailySnapshot = {
    date: today,
    totalEvents: events.length,
    shutdowns: events.filter(e => e.category === 'shutdown').length,
    censorship: events.filter(e => e.category === 'censorship').length,
    averageConfidence: events.length > 0 
      ? events.reduce((acc, e) => acc + e.confidence, 0) / events.length 
      : 0
  };

  await redis.set(key, JSON.stringify(snapshot), { ex: 60 * 60 * 24 * HISTORY_RETENTION_DAYS });
}

export async function getGlobalHistory(): Promise<DailySnapshot[]> {
  const r = redis;
  if (!r) return [];

  const keys = await r.keys(`${HISTORY_KEY_PREFIX}*`);
  if (keys.length === 0) return [];

  const snapshots = await Promise.all(
    keys.map(async (key) => {
      const data = await r.get(key);
      return data as DailySnapshot;
    })
  );

  return snapshots.sort((a, b) => a.date.localeCompare(b.date));
}
