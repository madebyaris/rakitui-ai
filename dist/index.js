#!/usr/bin/env node
import { MCPServer } from "mcp-framework";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
// Get the current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Resolve the real script path (in case of symlinks)
const realScriptPath = fs.realpathSync(process.argv[1]);
const packageRoot = dirname(realScriptPath);
/**
 * Create and start the MCP server
 * The server will automatically discover and load tools from the tools/ directory
 */
const server = new MCPServer({
    name: "rakitui-ai",
    version: "1.0.4",
    basePath: packageRoot // Use the real package location
});
// Output diagnostic information
console.log("Starting Rakit UI AI MCP server...");
console.log("Current directory:", process.cwd());
console.log("Script path:", process.argv[1]);
console.log("Real script path:", realScriptPath);
console.log("Package root:", packageRoot);
console.log("Expected tools path:", path.join(packageRoot, "tools"));
// Check if tools directory exists
const toolsPath = path.join(packageRoot, "tools");
try {
    const toolsExist = fs.existsSync(toolsPath);
    console.log("Tools directory exists:", toolsExist);
    if (toolsExist) {
        const files = fs.readdirSync(toolsPath);
        console.log("Files in tools directory:", files);
    }
}
catch (error) {
    console.log("Error checking tools directory:", error instanceof Error ? error.message : String(error));
}
/**
 * Start the server and handle any initialization errors
 */
server.start().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
