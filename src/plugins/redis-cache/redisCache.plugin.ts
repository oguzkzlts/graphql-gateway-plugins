import { GatewayPlugin } from "../plugin.interface"
import { redisClient } from "../../cache/redisClient"

const CACHE_TTL = 60 // seconds

export const redisCachePlugin: GatewayPlugin = {
    name: "redisCache",

    async onRequest(context) {
        if (!context.query) return

        const key = JSON.stringify({
            query: context.query,
            variables: context.variables
        })

        const cached = await redisClient.get(key)

        if (cached) {
            console.log("⚡ Cache hit")

            context.response = JSON.parse(cached)
            context.__fromCache = true
        }
    },

    async onResponse(context) {
        if (!context.query || context.__fromCache) return

        const key = JSON.stringify({
            query: context.query,
            variables: context.variables
        })

        await redisClient.setEx(
            key,
            CACHE_TTL,
            JSON.stringify(context.response)
        )

        console.log("💾 Cached response")
    }
}