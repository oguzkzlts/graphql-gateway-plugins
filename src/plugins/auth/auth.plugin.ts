import { GatewayPlugin, GatewayPluginContext } from "../plugin.interface"
import jwt, { JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret"

export const authPlugin: GatewayPlugin = {
    name: "auth",

    onRequest(context: GatewayPluginContext) {
        const authHeader = context.req?.headers["authorization"]
        if (!authHeader) throw new Error("Authorization header missing")

        const token = authHeader.replace("Bearer ", "")

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

            if (!decoded.sub) throw new Error("Invalid token payload")

            context.user = {
                id: decoded.sub,
                role: decoded.role || "user",
                email: decoded.email
            }

            if (!["user", "admin"].includes(context.user.role)) {
                throw new Error("Insufficient permissions")
            }
        } catch (err) {
            console.error("Authentication error:", err)
            throw new Error("Unauthorized")
        }
    }
}