import {GraphQLSchema} from "graphql/type";
import {DocumentNode} from "graphql/language";

export interface GatewayPluginContext {
    query?: string
    variables?: Record<string, any>
    response?: any
    __fromCache?: boolean
    req?: any
    user?: any
    __startTime?: number

    document?: DocumentNode
    schema?: GraphQLSchema
}

export interface GatewayPlugin {
    name: string

    onRequest?(context: GatewayPluginContext): Promise<void> | void

    onResponse?(context: GatewayPluginContext): Promise<void> | void

    onError?(error: Error): Promise<void> | void
}