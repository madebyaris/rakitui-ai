#!/usr/bin/env node
import { MCPServer } from "mcp-framework";
/**
 * Create and start the MCP server
 * The server will automatically discover and load tools from the tools/ directory
 */
const server = new MCPServer({
    name: "rakitui-ai",
    version: "1.0.3"
});
// Output diagnostic information
console.log("Starting Rakit UI AI MCP server...");
console.log("Current directory:", process.cwd());
console.log("Script path:", process.argv[1]);
/**
 * Start the server and handle any initialization errors
 */
server.start().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
