import Redis from "ioredis"

let redisClient: Redis | null = null

export async function connectRedis() {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
        redisClient.on("connect", () => console.log("Redis connected"))
        redisClient.on("error", (err) => console.error("Redis error:", err))
    }
    return redisClient
}

export function getRedis() {
    if (!redisClient) throw new Error("Redis client not initialized")
    return redisClient
}