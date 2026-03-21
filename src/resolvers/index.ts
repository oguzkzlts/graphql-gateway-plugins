import { fetchUsers, fetchUserById } from "../services/user.service"
import { fetchPosts } from "../services/post.service"
import { GraphQLContext } from "../types/context"

export const resolvers = {
    Query: {
        users: async () => fetchUsers(),

        user: async (_: any, args: { id: string }) => {
            return fetchUserById(args.id)
        },

        posts: async () => fetchPosts()
    },

    User: {
        posts: async (parent: any, _: any, context: GraphQLContext) => {
            return context.loaders.postLoader.load(parent.id)
        }
    }
}