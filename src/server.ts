import { ApolloServer } from "apollo-server"
import { PluginManager } from "./plugins/plugin.manager"
import { loadPlugins } from "./utils/pluginLoader"
import { GatewayPluginContext } from "./plugins/plugin.interface"
import { connectRedis } from "./cache/redisClient"
import { GraphQLContext } from "./types/context"
import { createPostLoader } from "./loaders/post.loader"
import { typeDefs } from "./schema"
import { resolvers } from "./resolvers"

const pluginManager = new PluginManager()
loadPlugins(pluginManager)

async function startServer() {
    // ✅ Ensure Redis is connected first
    await connectRedis()

    const server = new ApolloServer({
        typeDefs,
        resolvers,

        context: async ({ req }): Promise<GraphQLContext> => {
            const pluginContext: GatewayPluginContext = {
                query: req.body?.query,
                variables: req.body?.variables,
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

                            // Store data (cleaner cache)
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
    const { url } = await server.listen({ port: 4000 })

    console.log(`Gateway running at ${url}`)
}

startServer().catch(async (err) => {
    console.error("Server startup error:", err)
    await pluginManager.executeError(err)
})