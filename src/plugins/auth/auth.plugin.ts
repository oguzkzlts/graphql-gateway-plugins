import {GatewayPlugin} from "../plugin.interface"

export const authPlugin: GatewayPlugin = {
    name: "auth",
    onRequest(context: any) {
        const authHeader = context.req?.headers["authorization"]
        if (!authHeader) {
            return //TODO: prevent public access later
        }
        const token = authHeader.replace("Bearer ", "")
        try {
            //TODO: Replace later with real JWT verification
            context.user = fakeVerify(token)
        } catch (err) {
            throw new Error("Unauthorized")
        }
    }
}

// Temporary mock
function fakeVerify(token: string) {
    if (token === "valid-token") {
        return { id: "1", role: "user" }
    }
    throw new Error("Invalid token")
}
