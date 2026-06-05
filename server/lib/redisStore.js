const REDIS_KEY = 'trendkaari:store:v1';

export function useRedisPersistence() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

let redisClient = null;

async function getRedis() {
  if (!redisClient) {
    const { Redis } = await import('@upstash/redis');
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

export async function loadStoreFromRedis() {
  const redis = await getRedis();
  const data = await redis.get(REDIS_KEY);
  if (!data) return null;
  if (typeof data === 'string') return JSON.parse(data);
  return data;
}

export async function saveStoreToRedis(store) {
  const redis = await getRedis();
  await redis.set(REDIS_KEY, JSON.stringify(store));
}
