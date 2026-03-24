import { fetchUsers, fetchUserById } from "../services/user.service"
import { fetchPosts } from "../services/post.service"
import { GraphQLContext } from "../types/context"

export const resolvers = {
    Query: {
        users: async (_: any, __: any, context: GraphQLContext) => {
            if (!context.pluginContext.user) {
                throw new Error("Unauthorized")
            }
            return fetchUsers()
        },

        user: async (_: any, args: { id: string }, context: GraphQLContext) => {
            if (!context.pluginContext.user) {
                throw new Error("Unauthorized")
            }
            return fetchUserById(args.id)
        },

        posts: async (_: any, __: any, context: GraphQLContext) => {
            if (!context.pluginContext.user) {
                throw new Error("Unauthorized")
            }
            return fetchPosts()
        }
    },

    User: {
        posts: async (parent: any, _: any, context: GraphQLContext) => {
            return context.loaders.postLoader.load(parent.id)
        }
    }
}