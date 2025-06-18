import { MCPServer } from "mcp-framework";
import { DesignselectionTool } from "./tools/DesignselectionTool.js";

/**
 * Create a new instance of the design selection tool
 * This tool allows users to compare and select from three different UI component designs
 */
const designselectionTool = new DesignselectionTool();

/**
 * Export tools for the MCP framework to discover
 * Add new tools to this array as they are created
 */
export const tools = [designselectionTool];

/**
 * Create and start the MCP server
 * The server handles communication between the tool and clients
 */
const server = new MCPServer();

// Output diagnostic information
console.log(`Starting MCP server with tools: ${tools.map(t => t.name).join(', ')}`);

/**
 * Start the server and handle any initialization errors
 */
server.start().catch((error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});