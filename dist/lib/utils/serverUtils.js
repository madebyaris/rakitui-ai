import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import open from 'open';
import { WebSocketServer, WebSocket } from 'ws';
// For handling ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Globals to maintain state
let selectedDesign = null;
let selectionComplete = false;
let server = null;
let wss = null;
let activeWebSocket = null;
let port = 3000;
let pendingDesigns = null;
// Create a temporary directory for HTML files if it doesn't exist
const tmpDir = path.join(__dirname, '../../../tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}
// Custom logger that doesn't interfere with MCP JSON responses
const logger = {
    log: (message) => {
        // Write to stderr instead of stdout to avoid interfering with MCP JSON
        process.stderr.write(`[INFO] ${message}\n`);
        // Also log to a debug file for troubleshooting
        try {
            fs.appendFileSync(path.join(tmpDir, 'debug.log'), `${new Date().toISOString()} [INFO] ${message}\n`);
        }
        catch (err) {
            // Silently fail if we can't write to the debug file
        }
    },
    error: (message) => {
        process.stderr.write(`[ERROR] ${message}\n`);
        // Also log to a debug file for troubleshooting
        try {
            fs.appendFileSync(path.join(tmpDir, 'debug.log'), `${new Date().toISOString()} [ERROR] ${message}\n`);
        }
        catch (err) {
            // Silently fail if we can't write to the debug file
        }
    }
};
/**
 * Serves HTML content on localhost and opens in a browser
 * @param filename - Base filename for the HTML file
 * @param htmlContent - The HTML content to serve
 * @returns URL of the served content
 */
export async function serveHtmlOnLocalhost(filename, htmlContent) {
    // Reset state for new serving session
    selectedDesign = null;
    selectionComplete = false;
    pendingDesigns = null;
    // Clean up any existing server first
    if (server) {
        try {
            server.close();
            server = null;
        }
        catch (e) {
            // Ignore cleanup errors
        }
    }
    if (wss) {
        try {
            wss.close();
            wss = null;
        }
        catch (e) {
            // Ignore cleanup errors
        }
    }
    // Create a temp HTML file
    const htmlFilePath = path.join(tmpDir, `${filename}-${Date.now()}.html`);
    fs.writeFileSync(htmlFilePath, htmlContent);
    // Find an available port starting from the current port
    let currentPort = await findAvailablePort(port);
    // Try to create server on the available port
    let attempts = 0;
    const maxAttempts = 10;
    let serverCreated = false;
    while (!serverCreated && attempts < maxAttempts) {
        try {
            await createServer(currentPort, htmlFilePath);
            serverCreated = true;
        }
        catch (error) {
            if (error.code === 'EADDRINUSE') {
                logger.log(`Port ${currentPort} in use, finding next available port...`);
                currentPort = await findAvailablePort(currentPort + 1);
                attempts++;
            }
            else {
                throw error;
            }
        }
    }
    if (!serverCreated) {
        throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
    }
    // Update the global port for next time (use next port to avoid immediate conflicts)
    port = currentPort + 1;
    const url = `http://localhost:${currentPort}/design-selection`;
    // Open the URL in the default browser
    await open(url);
    return url;
}
/**
 * Finds an available port by attempting to create a server on it
 */
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const testServer = http.createServer();
        testServer.listen(startPort, () => {
            const address = testServer.address();
            const port = address && typeof address === 'object' ? address.port : null;
            testServer.close(() => {
                if (port) {
                    resolve(port);
                }
                else {
                    reject(new Error('Could not determine port'));
                }
            });
        });
        testServer.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try next port
                testServer.close(() => {
                    findAvailablePort(startPort + 1).then(resolve).catch(reject);
                });
            }
            else {
                reject(err);
            }
        });
    });
}
/**
 * Creates an HTTP server on the specified port with WebSocket support
 */
function createServer(port, htmlFilePath) {
    return new Promise((resolve, reject) => {
        // Clean up any existing server first
        if (server) {
            try {
                server.close();
            }
            catch (e) {
                // Ignore errors during cleanup
            }
            server = null;
        }
        if (wss) {
            try {
                wss.close();
            }
            catch (e) {
                // Ignore errors during cleanup
            }
            wss = null;
        }
        // Create the server that will serve the HTML and handle the selection
        server = http.createServer((req, res) => {
            // Enable CORS for all responses
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }
            // Route for design selection page
            if (req.url === '/design-selection') {
                // Send the HTML file content
                res.writeHead(200, { 'Content-Type': 'text/html' });
                const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                res.end(htmlContent);
            }
            // Route for recording the selection (keep for backward compatibility)
            else if (req.url === '/design-selection-result' && req.method === 'POST') {
                logger.log(`Received POST request to /design-selection-result`);
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                    logger.log(`Received data chunk: ${chunk.toString()}`);
                });
                req.on('end', () => {
                    logger.log(`Request body complete: ${body}`);
                    try {
                        const data = JSON.parse(body);
                        logger.log(`Successfully parsed JSON. Design selected: ${data.selectedDesign}`);
                        selectedDesign = data.selectedDesign;
                        // Write to the debug log file
                        fs.appendFileSync(path.join(tmpDir, 'selection.log'), `SELECTION: ${data.selectedDesign}\n`);
                        // Notify via WebSocket if connected
                        if (activeWebSocket && activeWebSocket.readyState === WebSocket.OPEN) {
                            activeWebSocket.send(JSON.stringify({
                                type: 'selection',
                                selectedDesign: data.selectedDesign,
                                timestamp: new Date().toISOString()
                            }));
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'success', message: 'Design selection received' }));
                        logger.log(`Response sent with status 200`);
                    }
                    catch (error) {
                        logger.error(`Error parsing JSON: ${error}`);
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
                    }
                });
            }
            // 404 for any other routes
            else {
                res.writeHead(404);
                res.end('Not found');
            }
        });
        // Create WebSocket server
        wss = new WebSocketServer({ server });
        wss.on('connection', (ws) => {
            logger.log('WebSocket client connected');
            activeWebSocket = ws;
            // Send initial connection status
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'WebSocket connection established'
            }));
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    logger.log(`WebSocket message received: ${JSON.stringify(data)}`);
                    if (data.type === 'selection') {
                        selectedDesign = data.selectedDesign;
                        fs.appendFileSync(path.join(tmpDir, 'selection.log'), `SELECTION: ${data.selectedDesign}\n`);
                        // Send confirmation back
                        ws.send(JSON.stringify({
                            type: 'selection-confirmed',
                            selectedDesign: data.selectedDesign,
                            timestamp: new Date().toISOString()
                        }));
                    }
                    else if (data.type === 'request-designs') {
                        // Client is requesting designs - send if available
                        if (pendingDesigns) {
                            ws.send(JSON.stringify({
                                type: 'designs-ready',
                                ...pendingDesigns
                            }));
                        }
                    }
                }
                catch (error) {
                    logger.error(`WebSocket message error: ${error}`);
                }
            });
            ws.on('close', () => {
                logger.log('WebSocket client disconnected');
                if (activeWebSocket === ws) {
                    activeWebSocket = null;
                }
            });
            ws.on('error', (error) => {
                logger.error(`WebSocket error: ${error}`);
            });
        });
        // Handle server errors BEFORE calling listen
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.log(`Port ${port} is in use, will try next port`);
                // Don't reject here - let the caller handle port selection
                reject(error);
            }
            else {
                logger.error(`Server error: ${error.message}`);
                reject(error);
            }
        });
        // Start the server
        server.listen(port, () => {
            logger.log(`Server running at http://localhost:${port}/design-selection`);
            resolve();
        });
    });
}
/**
 * Returns the selected design
 */
export function getSelectedDesign() {
    logger.log(`getSelectedDesign called, current value: ${selectedDesign}`);
    return selectedDesign;
}
/**
 * Update designs and notify connected clients
 */
export function updateDesigns(designs) {
    logger.log('Updating designs and notifying clients');
    pendingDesigns = designs;
    // Notify all connected WebSocket clients
    if (wss) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'designs-ready',
                    ...designs
                }));
            }
        });
    }
}
/**
 * Checks if selection process is complete
 */
export function isSelectionComplete() {
    logger.log(`isSelectionComplete called, current value: ${selectionComplete}`);
    return selectionComplete;
}
/**
 * Notifies that the selection is finalized
 */
export function notifySelectionFinalized() {
    logger.log('notifySelectionFinalized called');
    selectionComplete = true;
    // Notify via WebSocket
    if (activeWebSocket && activeWebSocket.readyState === WebSocket.OPEN) {
        activeWebSocket.send(JSON.stringify({
            type: 'finalized',
            message: 'Selection process complete'
        }));
    }
}
/**
 * Stops the local server
 */
export function stopLocalServer() {
    if (wss) {
        wss.close(() => {
            logger.log('WebSocket server closed');
        });
        wss = null;
    }
    if (activeWebSocket) {
        activeWebSocket.close();
        activeWebSocket = null;
    }
    if (server) {
        try {
            // Use a more graceful shutdown approach
            server.close(() => {
                logger.log('Local server stopped gracefully');
                server = null;
            });
            // Set a timeout to forcefully close if it takes too long
            setTimeout(() => {
                if (server) {
                    logger.log('Forcing server shutdown');
                    server = null;
                }
            }, 3000);
        }
        catch (error) {
            logger.error('Error stopping server: ' + error);
            server = null;
        }
    }
}
