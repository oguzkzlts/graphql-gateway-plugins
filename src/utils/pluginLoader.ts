import fs from "fs"
import path from "path"
import { PluginManager } from "../plugins/plugin.manager"
import { GatewayPlugin } from "../plugins/plugin.interface"

export function loadPlugins(pluginManager: PluginManager) {
    const pluginsDir = path.join(__dirname, "../plugins")
    const pluginFolders = fs.readdirSync(pluginsDir)

    for (const folder of pluginFolders) {
        const fullPath = path.join(pluginsDir, folder)
        // Skip non-directories and core files
        if (
            !fs.statSync(fullPath).isDirectory() ||
            folder.startsWith("plugin.")
        ) {
            continue
        }
        try {
            // Look for index.ts or plugin file
            const pluginPath = path.join(fullPath)
            const pluginModule = require(pluginPath)
            const plugin: GatewayPlugin =
                pluginModule.default ||
                pluginModule[Object.keys(pluginModule)[0]]

            if (plugin && plugin.name) {
                pluginManager.register(plugin)
                console.log(`Loaded plugin: ${plugin.name}`)
            }
        } catch (err) {
            console.warn(`Failed to load plugin from ${folder}`, err)
        }
    }
}