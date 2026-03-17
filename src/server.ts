import { ApolloServer, gql } from "apollo-server"
import { PluginManager } from "./plugins/plugin.manager"
import { loggerPlugin } from "./plugins/logger.plugin"
import { GatewayPluginContext } from "./plugins/plugin.interface"

const pluginManager = new PluginManager()

// Register plugins here
pluginManager.register(loggerPlugin)

const typeDefs = gql`
  type Query {
    health: String
  }
`

const resolvers = {
    Query: {
        health: async (_: any, __: any, context: any) => {
            return "GraphQL Gateway Running"
        }
    }
}

async function startServer() {
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
                await pluginManager.executeError(error as Error)
            }
            return {
                pluginContext
            }
        },

        plugins: [
            {
                async requestDidStart() {
                    return {
                        async willSendResponse(requestContext) {
                            const pluginContext =
                                requestContext.context.pluginContext as GatewayPluginContext
                            pluginContext.response = requestContext.response
                            await pluginManager.executeResponse(pluginContext)
                        }
                    }
                }
            }
        ]
    })
    const { url } = await server.listen({ port: 4000 })
    console.log(`Gateway running at ${url}`)
}

startServer()