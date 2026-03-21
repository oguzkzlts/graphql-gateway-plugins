import { GatewayPluginContext } from "../plugins/plugin.interface"
import DataLoader from "dataloader"

export interface GraphQLContext {
    pluginContext: GatewayPluginContext
    loaders: {
        postLoader: DataLoader<string, any[]>
    }
}