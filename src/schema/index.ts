import { gql } from "apollo-server"

export const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
        posts: [Post!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        userId: ID!
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
        posts: [Post!]!
    }
`