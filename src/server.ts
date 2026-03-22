import express from "express"
import { ApolloServer } from "apollo-server-express"
import { PluginManager } from "./plugins/plugin.manager"
import { loadPlugins } from "./utils/pluginLoader"
import { GatewayPluginContext } from "./plugins/plugin.interface"
import { connectRedis } from "./cache/redisClient"
import { GraphQLContext } from "./types/context"
import { createPostLoader } from "./loaders/post.loader"
import { typeDefs } from "./schema"
import { resolvers } from "./resolvers"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { getMetrics } from "./plugins/metrics/metrics.store"
import { parse } from "graphql"

const pluginManager = new PluginManager()
loadPlugins(pluginManager)

async function startServer() {
    await connectRedis()

    const app = express()

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    })

    const server = new ApolloServer({
        schema,

        context: async ({ req }): Promise<GraphQLContext> => {
            const query = req.body?.query
            const variables = req.body?.variables

            let document

            try {
                if (query) {
                    document = parse(query) // parse GraphQL query
                }
            } catch (err) {
                console.error("Query parse error:", err)
            }

            const pluginContext: GatewayPluginContext = {
                query,
                variables,
                document,
                schema,
                req
            }

            try {
                await pluginManager.executeRequest(pluginContext)
            } catch (error) {
                console.error("Plugin request error:", error)
                await pluginManager.executeError(error as Error)
            }

            return {
                pluginContext,
                loaders: {
                    postLoader: createPostLoader()
                }
            }
        },

        plugins: [
            {
                async requestDidStart() {
                    return {
                        async willSendResponse(requestContext) {
                            const pluginContext =
                                requestContext.context.pluginContext as GatewayPluginContext

                            pluginContext.response = requestContext.response.data

                            try {
                                await pluginManager.executeResponse(pluginContext)
                            } catch (error) {
                                console.error("Plugin response error:", error)
                                await pluginManager.executeError(error as Error)
                            }
                        }
                    }
                }
            }
        ]
    })

    // Start Apollo
    await server.start()

    // Attach GraphQL to Express
    server.applyMiddleware({ app, path: "/graphql" })

    app.get("/metrics", (_req, res) => {
        res.json(getMetrics())
    })

    app.listen(4000, () => {
        console.log("GraphQL: http://localhost:4000/graphql")
        console.log("Metrics: http://localhost:4000/metrics")
    })
}

startServer().catch(async (err) => {
    console.error("Server startup error:", err)
    await pluginManager.executeError(err)
})
