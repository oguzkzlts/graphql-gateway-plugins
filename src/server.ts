import { ApolloServer, gql } from "apollo-server"

const typeDefs = gql`
  type Query {
    health: String
  }
`

const resolvers = {
    Query: {
        health: () => "GraphQL Gateway Running 🚀"
    }
}

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })

    const { url } = await server.listen({ port: 4000 })

    console.log(`🚀 Gateway running at ${url}`)
}

startServer()