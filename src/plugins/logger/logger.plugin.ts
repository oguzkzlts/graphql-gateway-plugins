import { GatewayPlugin } from "../plugin.interface"

export const loggerPlugin: GatewayPlugin = {
    name: "logger",

    onRequest(context) {
        console.log("Incoming GraphQL request:", context.query)
    },

    onResponse(context) {
        console.log("GraphQL response sent")
    }
}