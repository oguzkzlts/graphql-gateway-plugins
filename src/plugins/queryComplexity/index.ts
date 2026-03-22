import {
    getComplexity,
    simpleEstimator
} from "graphql-query-complexity"
import { GraphQLError } from "graphql"
import { GatewayPlugin } from "../plugin.interface"

const MAX_COMPLEXITY = 50

const queryComplexityPlugin: GatewayPlugin = {
    name: "queryComplexity",

    onRequest(context) {
        const { schema, document, variables } = context

        if (!schema || !document) return

        const complexity = getComplexity({
            schema,
            query: document,
            variables,
            estimators: [
                simpleEstimator({ defaultComplexity: 1 })
            ]
        })

        console.log(`Query complexity: ${complexity}`)

        if (complexity > MAX_COMPLEXITY) {
            throw new GraphQLError(
                `Query is too complex: ${complexity}. Max allowed: ${MAX_COMPLEXITY}`
            )
        }
    }
}

export default queryComplexityPlugin