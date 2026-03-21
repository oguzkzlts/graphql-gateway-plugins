import { GatewayPlugin } from "../plugin.interface"

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100

const requests = new Map<string, { count: number; startTime: number }>()

export const rateLimitPlugin: GatewayPlugin = {
    name: "rateLimit",
    onRequest(context: any) {
        const ip =
            context.req?.headers["x-forwarded-for"] ||
            context.req?.socket?.remoteAddress ||
            "unknown"
        const now = Date.now()

        if (!requests.has(ip)) {
            requests.set(ip, { count: 1, startTime: now })
            return
        }
        const entry = requests.get(ip)!

        if (now - entry.startTime > WINDOW_MS) {
            requests.set(ip, { count: 1, startTime: now })
            return
        }
        entry.count++

        if (entry.count > MAX_REQUESTS) {
            throw new Error("Rate limit exceeded")
        }
    }
}
