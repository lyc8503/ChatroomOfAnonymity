import Redis, { RedisOptions } from "ioredis";
import { REDIS_CONFIG } from "../config";

export function createRedisInstance() {
  try {
    const options: RedisOptions = {
      host: REDIS_CONFIG.host,
      port: REDIS_CONFIG.port,
      password: REDIS_CONFIG.password,
      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      retryStrategy: (times: number) => {
        if (times > 3) {
          throw new Error(`[Redis] Could not connect after ${times} attempts`);
        }

        return Math.min(times * 200, 1000);
      },
    };

    const redis = new Redis(options);

    redis.on("error", (error: unknown) => {
      console.log("[Redis] Error connecting", error);
    });

    return redis;
  } catch (e) {
    console.log(e);
    throw new Error(`[Redis] Could not create a Redis instance`);
  }
}
