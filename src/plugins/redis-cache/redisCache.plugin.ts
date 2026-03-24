import { GatewayPlugin, GatewayPluginContext } from "../plugin.interface"
import { getRedis } from "../../cache/redisClient"
import crypto from "crypto"
import { recordCacheHit, recordCacheMiss } from "../metrics/metrics.store"

const CACHE_TTL = Number(process.env.REDIS_TTL) || 60 // seconds

function generateCacheKey(context: GatewayPluginContext) {
    const rawKey = JSON.stringify({ query: context.query, variables: context.variables })
    return crypto.createHash("sha256").update(rawKey).digest("hex")
}

export const redisCachePlugin: GatewayPlugin = {
    name: "redisCache",

    async onRequest(context) {
        if (!context.query) return

        const redis = getRedis()
        const key = generateCacheKey(context)

        try {
            const cached = await redis.get(key)
            if (cached) {
                context.response = JSON.parse(cached)
                context.__fromCache = true
                recordCacheHit()
                console.log(`[Cache] Hit for key: ${key}`)
            } else {
                recordCacheMiss()
                console.log(`[Cache] Miss for key: ${key}`)
            }
        } catch (err) {
            console.warn("Redis read error:", err)
        }
    },

    async onResponse(context) {
        if (!context.query || context.__fromCache) return

        const redis = getRedis()
        const key = generateCacheKey(context)

        try {
            await redis.set(key, JSON.stringify(context.response), "EX", CACHE_TTL)
            console.log(`[Cache] Stored response for key: ${key} (TTL: ${CACHE_TTL}s)`)
        } catch (err) {
            console.warn("Redis write error:", err)
        }
    }
}