import { GatewayPlugin, GatewayPluginContext } from "./plugin.interface"

export class PluginManager {
    private plugins: GatewayPlugin[] = []

    register(plugin: GatewayPlugin) {
        this.plugins.push(plugin)
    }

    async executeRequest(context: GatewayPluginContext) {
        for (const plugin of this.plugins) {
            if (plugin.onRequest) {
                await plugin.onRequest(context)
            }
        }
    }

    async executeResponse(context: GatewayPluginContext) {
        for (const plugin of this.plugins) {
            if (plugin.onResponse) {
                await plugin.onResponse(context)
            }
        }
    }

    async executeError(error: Error) {
        for (const plugin of this.plugins) {
            if (plugin.onError) {
                await plugin.onError(error)
            }
        }
    }
}