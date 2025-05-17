import * as http from 'http';
import open from 'open';
import * as net from 'net';
import * as child_process from 'child_process';

// Define constants first
const DEFAULT_PORT = 8899;

// Initial cleanup to kill any existing processes on the default port
(function cleanupExistingServers() {
  try {
    // This is platform-specific but works on macOS/Linux
    if (process.platform === 'darwin' || process.platform === 'linux') {
      child_process.execSync(`lsof -i:${DEFAULT_PORT} -t | xargs kill -9 2>/dev/null || true`);
    } else if (process.platform === 'win32') {
      // Windows alternative
      child_process.execSync(`FOR /F "tokens=5" %P IN ('netstat -ano | findstr :${DEFAULT_PORT}') DO taskkill /F /PID %P 2>nul || echo No process`);
    }
  } catch (error) {
    // Ignore errors, as this is just a precaution
  }
})();

let server: http.Server | null = null;
let selectedDesign: string | null = null;
let selectionComplete = false;
let selectionFinalized = false;
let lastClientConnection: http.ServerResponse | null = null;

/**
 * Check if a port is in use
 * @param port The port to check
 * @returns Promise that resolves to true if port is available, false otherwise
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => {
        // Port is in use
        resolve(false);
      })
      .once('listening', () => {
        // Port is available
        tester.close();
        resolve(true);
      })
      .listen(port);
  });
}

/**
 * Find an available port starting from the provided port
 * @param startPort Port to start checking from
 * @returns Promise that resolves to an available port
 */
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      // Limit search to 100 ports to avoid infinite loop
      throw new Error('Could not find an available port');
    }
  }
  return port;
}

/**
 * Serves HTML content on a local server and opens a browser
 * @param path The URL path to serve the content on
 * @param htmlContent The HTML content to serve
 * @returns The URL of the served content
 */
export async function serveHtmlOnLocalhost(path: string, htmlContent: string): Promise<string> {
  // Clean the path to ensure it starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const resultPath = '/design-selection-result';
  const finalizedPath = '/design-selection-finalized';
  
  // Reset the selected design and selection status
  selectedDesign = null;
  selectionComplete = false;
  selectionFinalized = false;
  lastClientConnection = null;
  
  // Close any existing server
  if (server) {
    try {
      server.close();
    } catch (error) {
      // Ignore errors
    }
    server = null;
  }

  // Try to find an available port
  let port;
  try {
    port = await findAvailablePort(DEFAULT_PORT);
  } catch (error) {
    throw new Error('Could not start server: no available ports');
  }

  // Create a new server
  server = http.createServer((req, res) => {
    // Store the most recent client connection for later use
    lastClientConnection = res;
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS pre-flight request
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Handle the design selection page
    if (req.url === cleanPath) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlContent);
      return;
    }
    
    // Handle the design selection result
    if (req.url === resultPath && req.method === 'POST') {
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          selectedDesign = data.selectedDesign;
          selectionComplete = true;
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            status: 'success', 
            message: 'Design selection received',
            selectedDesign
          }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
        }
      });
      
      return;
    }
    
    // Handle browser polling for finalization status
    if (req.url === finalizedPath && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'success',
        finalized: selectionFinalized
      }));
      return;
    }
    
    // 404 for everything else
    res.writeHead(404);
    res.end('Not found');
  });

  // Start the server
  return new Promise((resolve, reject) => {
    server!.on('error', (err) => {
      reject(err);
    });
    
    server!.listen(port, async () => {
      const url = `http://localhost:${port}${cleanPath}`;
      
      try {
        // Open browser quietly without logging
        setTimeout(async () => {
          try {
            await open(url, {wait: false});
          } catch (innerError) {
            try {
              await open(url, {app: {name: 'google chrome'}});
            } catch {
              try {
                await open(url, {app: {name: 'firefox'}});
              } catch {
                try {
                  await open(url, {app: {name: 'safari'}});
                } catch (finalError) {
                  // Silent error - just let the user know the URL
                }
              }
            }
          }
        }, 500);
      } catch (error) {
        // Silent error - just let the user know the URL
      }
      
      resolve(url);
    });
  });
}

/**
 * Notify the browser that the selection has been finalized
 */
export function notifySelectionFinalized(): void {
  selectionFinalized = true;
  
  // Force quick server shutdown on next tick
  process.nextTick(() => {
    stopLocalServer();
  });
}

/**
 * Get the selected design
 * @returns The name of the selected design or null if none selected
 */
export function getSelectedDesign(): string | null {
  return selectedDesign;
}

/**
 * Check if selection is complete
 * @returns True if selection is complete, false otherwise
 */
export function isSelectionComplete(): boolean {
  return selectionComplete;
}

/**
 * Stops the local server if it's running
 */
export function stopLocalServer(): void {
  if (server) {
    try {
      // Force terminate connections aggressively
      
      // First try normal close
      try {
        server.close();
      } catch (e) {
        // Ignore any errors
      }
      
      // Then try port kill on macOS/Linux
      try {
        if (process.platform === 'darwin' || process.platform === 'linux') {
          child_process.execSync(`lsof -i:${DEFAULT_PORT} -t | xargs kill -9 2>/dev/null || true`);
        } else if (process.platform === 'win32') {
          child_process.execSync(`FOR /F "tokens=5" %P IN ('netstat -ano | findstr :${DEFAULT_PORT}') DO taskkill /F /PID %P 2>nul || echo No process`);
        }
      } catch (e) {
        // Ignore any errors
      }
      
      server = null;
    } catch (error) {
      // Ignore all errors during shutdown
    }
  }
}

// Ensure the server is closed when the process exits
process.on('exit', stopLocalServer);
process.on('SIGINT', () => {
  stopLocalServer();
  process.exit(0);
}); 