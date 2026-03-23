import fs from "fs"
import path from "path"
import { PluginManager } from "../plugins/plugin.manager"
import { GatewayPlugin } from "../plugins/plugin.interface"

export function loadPlugins(pluginManager: PluginManager) {
    const pluginsDir = path.join(__dirname, "../plugins")
    if (!fs.existsSync(pluginsDir)) return

    const pluginFolders = fs.readdirSync(pluginsDir).filter(f => {
        const fullPath = path.join(pluginsDir, f)
        return fs.statSync(fullPath).isDirectory() && !f.startsWith("plugin.")
    })

    for (const folder of pluginFolders) {
        const pluginPath = path.join(pluginsDir, folder, "index.js")
        if (!fs.existsSync(pluginPath)) continue

        try {
            const pluginModule = require(pluginPath)
            const plugin: GatewayPlugin =
                pluginModule.default ||
                pluginModule[Object.keys(pluginModule)[0]]

            if (plugin?.name) {
                pluginManager.register(plugin)
                console.log(`Loaded plugin: ${plugin.name}`)
            }
        } catch (err) {
            console.warn(`Failed to load plugin from ${folder}`, err)
        }
    }
}