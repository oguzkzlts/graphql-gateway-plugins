import express from "express"
import { ApolloServer } from "apollo-server-express"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { typeDefs } from "./schema"
import { resolvers } from "./resolvers"
import { PluginManager } from "./plugins/plugin.manager"
import { loadPlugins } from "./utils/pluginLoader"
import { connectRedis } from "./cache/redisClient"
import { createPostLoader } from "./loaders/post.loader"
import { getMetrics } from "./plugins/metrics/metrics.store"
import { GraphQLContext } from "./types/context"
import { GatewayPluginContext } from "./plugins/plugin.interface"

async function startServer() {
    await connectRedis()

    const app = express()
    app.use(express.json())

    const pluginManager = new PluginManager()
    loadPlugins(pluginManager)

    const schema = makeExecutableSchema({ typeDefs, resolvers })

    const server = new ApolloServer({
        schema,
        context: async ({ req }): Promise<GraphQLContext> => {
            const pluginContext: GatewayPluginContext = {
                query: req.body?.query,
                variables: req.body?.variables,
                schema,
                req,
                __startTime: Date.now()
            }

            try {
                await pluginManager.executeRequest(pluginContext)
            } catch (err) {
                console.error("Plugin request error:", err)
                await pluginManager.executeError(err as Error)
            }

            return {
                pluginContext,
                loaders: { postLoader: createPostLoader() }
            }
        },
        plugins: [
            {
                async requestDidStart(requestContext) {
                    // document is available here in requestContext
                    const pluginContext =
                        requestContext.context.pluginContext as GatewayPluginContext
                    pluginContext.document = requestContext.document

                    return {
                        async willSendResponse(requestContext) {
                            const pluginContext =
                                requestContext.context.pluginContext as GatewayPluginContext
                            pluginContext.response = requestContext.response.data

                            try {
                                await pluginManager.executeResponse(pluginContext)
                            } catch (err) {
                                console.error("Plugin response error:", err)
                                await pluginManager.executeError(err as Error)
                            }
                        }
                    }
                }
            }
        ]
    })

    await server.start()
    server.applyMiddleware({ app, path: "/graphql" })

    // Health check & metrics endpoints
    app.get("/health", (_req, res) => res.send("OK"))
    app.get("/metrics", (_req, res) => res.json(getMetrics()))

    const port = process.env.PORT || 4000
    app.listen(port, () => {
        console.log(`GraphQL server running at http://localhost:${port}/graphql`)
        console.log(`Metrics endpoint at http://localhost:${port}/metrics`)
    })
}

startServer().catch(async (err) => {
    console.error("Server startup failed:", err)
})