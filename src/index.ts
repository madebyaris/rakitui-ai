#!/usr/bin/env node
import { MCPServer } from "mcp-framework";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get the current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use __dirname for more reliable path resolution (works in both direct execution and MCP)
// __dirname points to dist/ when running dist/index.js
const distDir = __dirname; // dist/
const packageRoot = dirname(distDir); // project root

/**
 * Create and start the MCP server
 * The server will automatically discover and load tools from the tools/ directory
 * basePath should point to dist/ so it looks for dist/tools/
 */
const server = new MCPServer({
  name: "rakitui-ai", 
  version: "1.0.4",
  basePath: distDir  // Point to dist/ so it finds dist/tools/
});

// Output diagnostic information
console.log("Starting Rakit UI AI MCP server...");
console.log("Current directory:", process.cwd());
console.log("__dirname:", __dirname);
console.log("Dist directory:", distDir);
console.log("Package root:", packageRoot);
console.log("Expected tools path:", path.join(distDir, "tools"));

// Check if tools directory exists
const toolsPath = path.join(distDir, "tools");
try {
  const toolsExist = fs.existsSync(toolsPath);
  console.log("Tools directory exists:", toolsExist);
  if (toolsExist) {
    const files = fs.readdirSync(toolsPath);
    console.log("Files in tools directory:", files);
  }
} catch (error: unknown) {
  console.log("Error checking tools directory:", error instanceof Error ? error.message : String(error));
}

/**
 * Start the server and handle any initialization errors
 */
server.start().then(async () => {
  // Log tool discovery after server starts
  try {
    const tools = await (server as any).loadTools?.() || [];
    console.log(`[INFO] Server started. Discovered ${tools.length} tool(s):`, tools.map((t: any) => t.name || 'unnamed'));
  } catch (err) {
    console.log("[INFO] Could not list tools (this is normal if using framework's internal loading)");
  }
}).catch((error: Error) => {
  console.error("Server error:", error);
  console.error("Error stack:", error.stack);
  process.exit(1);
});