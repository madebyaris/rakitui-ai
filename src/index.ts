#!/usr/bin/env node
import { MCPServer } from "mcp-framework";

/**
 * Create and start the MCP server
 * The server will automatically discover and load tools from the tools/ directory
 */
const server = new MCPServer();

// Output diagnostic information
console.log("Starting Rakit UI AI MCP server...");

/**
 * Start the server and handle any initialization errors
 */
server.start().catch((error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});