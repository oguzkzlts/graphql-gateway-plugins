import { GatewayPlugin } from "../plugin.interface"
import {
    recordRequest,
    recordError,
    recordOperation
} from "./metrics.store"

export const metricsPlugin: GatewayPlugin = {
    name: "metrics-plugin",
    async onRequest(context) {
        context.__startTime = Date.now()

        // store query for operation tracking
        if (context.query) {
            context.__operationName = context.query
        }
    },
    async onResponse(context) {
        if (!context.__startTime) return

        const duration = Date.now() - context.__startTime
        recordRequest(duration)

        if (context.__operationName) {
            recordOperation(context.__operationName)
        }
    },
    async onError() {
        recordError()
    }
}