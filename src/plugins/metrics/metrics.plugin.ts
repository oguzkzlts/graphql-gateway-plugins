import { GatewayPlugin } from "../plugin.interface"
import { recordRequest, recordError } from "./metrics.store"

export const metricsPlugin: GatewayPlugin = {
    name: "metrics-plugin",
    async onRequest(context) {
        context.__startTime = Date.now()
    },
    async onResponse(context) {
        const duration = Date.now() - (context.__startTime || Date.now())
        recordRequest(duration)
    },
    async onError() {
        recordError()
    }
}
