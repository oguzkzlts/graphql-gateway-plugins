import { ApolloServer, gql } from "apollo-server"
import { PluginManager } from "./plugins/plugin.manager"
import { loadPlugins } from "./utils/pluginLoader"
import { GatewayPluginContext } from "./plugins/plugin.interface"
import { connectRedis } from "./cache/redisClient"

//const pluginManager = new PluginManager()

// Manual Register plugins
// pluginManager.register(loggerPlugin)
// pluginManager.register(redisCachePlugin)

const pluginManager = new PluginManager()
loadPlugins(pluginManager)

const typeDefs = gql`
  type Query {
    health: String
  }
`

const resolvers = {
    Query: {
        health: async (_: any, __: any, context: any) => {
            const pluginContext = context.pluginContext as GatewayPluginContext

            // 🔥 If cache already has response, return it
            if (pluginContext.__fromCache) {
                return pluginContext.response?.data?.health
            }

            return "GraphQL Gateway Running 🚀"
        }
    }
}

async function startServer() {
    await connectRedis()

    const server = new ApolloServer({
        typeDefs,
        resolvers,

        context: async ({ req }) => {
            const pluginContext: GatewayPluginContext = {
                query: req.body?.query,
                variables: req.body?.variables
            }

            try {
                await pluginManager.executeRequest(pluginContext)
            } catch (error) {
                console.error("Plugin request error:", error)
                await pluginManager.executeError(error as Error)
            }

            return { pluginContext }
        },

        plugins: [
            {
                async requestDidStart() {
                    return {
                        async willSendResponse(requestContext) {
                            const pluginContext =
                                requestContext.context.pluginContext as GatewayPluginContext

                            pluginContext.response = requestContext.response

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