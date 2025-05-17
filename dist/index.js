#!/usr/bin/env node
import { MCPServer } from "mcp-framework";
import { DesignselectionTool } from "./tools/DesignselectionTool.js";
// Create a new instance of the design selection tool
const designselectionTool = new DesignselectionTool();
// Export it for the MCP framework to discover
export const tools = [designselectionTool];
// Create and start the server
const server = new MCPServer();
// Output some diagnostic information
console.log(`Starting MCP server with tools: ${tools.map(t => t.name).join(', ')}`);
// Start the server
server.start().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
