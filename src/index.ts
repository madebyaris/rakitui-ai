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
  version: "1.1.0",
  basePath: distDir  // Point to dist/ so it finds dist/tools/
});

// Output diagnostic information to stderr (MCP protocol uses stdout for JSON)
process.stderr.write("Starting Rakit UI AI MCP server...\n");
process.stderr.write(`Current directory: ${process.cwd()}\n`);
process.stderr.write(`__dirname: ${__dirname}\n`);
process.stderr.write(`Dist directory: ${distDir}\n`);
process.stderr.write(`Package root: ${packageRoot}\n`);
process.stderr.write(`Expected tools path: ${path.join(distDir, "tools")}\n`);

// Check if tools directory exists
const toolsPath = path.join(distDir, "tools");
try {
  const toolsExist = fs.existsSync(toolsPath);
  process.stderr.write(`Tools directory exists: ${toolsExist}\n`);
  if (toolsExist) {
    const files = fs.readdirSync(toolsPath);
    process.stderr.write(`Files in tools directory: ${files.join(", ")}\n`);
  }
} catch (error: unknown) {
  process.stderr.write(`Error checking tools directory: ${error instanceof Error ? error.message : String(error)}\n`);
}

/**
 * Start the server and handle any initialization errors
 */
server.start().then(async () => {
  // Log tool discovery after server starts (to stderr for MCP protocol)
  try {
    const tools = await (server as any).loadTools?.() || [];
    process.stderr.write(`[INFO] Server started. Discovered ${tools.length} tool(s): ${tools.map((t: any) => t.name || 'unnamed').join(", ")}\n`);
  } catch (err) {
    process.stderr.write("[INFO] Could not list tools (this is normal if using framework's internal loading)\n");
  }
}).catch((error: Error) => {
  process.stderr.write(`Server error: ${error.message}\n`);
  process.stderr.write(`Error stack: ${error.stack}\n`);
  process.exit(1);
});