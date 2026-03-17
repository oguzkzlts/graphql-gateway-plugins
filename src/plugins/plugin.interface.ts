export interface GatewayPluginContext {
    query?: string
    variables?: Record<string, any>
    response?: any
}

export interface GatewayPlugin {
    name: string

    onRequest?(context: GatewayPluginContext): Promise<void> | void

    onResponse?(context: GatewayPluginContext): Promise<void> | void

    onError?(error: Error): Promise<void> | void
}