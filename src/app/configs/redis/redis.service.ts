import { Injectable } from "@nestjs/common";
import { redis } from "./redis.client";

@Injectable()
export class RedisService {
    get(key: string) {
        return redis.get(key);
    }

    set(key: string, value: string, ttl?: number) {
        if (ttl) {
            return redis.set(key, value, "EX", ttl);
        }
        return redis.set(key, value);
    }

    del(key: string) {
        return redis.del(key);
    }
}
