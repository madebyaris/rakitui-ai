import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import open from 'open';

// For handling ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Globals to maintain state
let selectedDesign = null;
let selectionComplete = false;
let server = null;
let port = 3000;

// Create a temporary directory for HTML files if it doesn't exist
const tmpDir = path.join(__dirname, '../../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Serves HTML content on localhost and opens in a browser
 * @param {string} filename - Base filename for the HTML file
 * @param {string} htmlContent - The HTML content to serve
 * @returns {string} URL of the served content
 */
export async function serveHtmlOnLocalhost(filename, htmlContent) {
  // Reset state for new serving session
  selectedDesign = null;
  selectionComplete = false;
  
  // Create a temp HTML file
  const htmlFilePath = path.join(tmpDir, `${filename}-${Date.now()}.html`);
  fs.writeFileSync(htmlFilePath, htmlContent);
  
  // Start at port 3000 and increment if needed
  let currentPort = port;
  let serverCreated = false;
  
  // Try ports until one works
  while (!serverCreated && currentPort < port + 100) {
    try {
      await createServer(currentPort, htmlFilePath);
      serverCreated = true;
    } catch (error) {
      console.log(`Port ${currentPort} in use, trying next port...`);
      currentPort++;
    }
  }
  
  if (!serverCreated) {
    throw new Error('Could not find an available port');
  }
  
  // Update the global port for next time
  port = currentPort + 1;
  
  const url = `http://localhost:${currentPort}/design-selection`;
  
  // Open the URL in the default browser
  await open(url);
  
  return url;
}

/**
 * Creates an HTTP server on the specified port
 */
function createServer(port, htmlFilePath) {
  return new Promise((resolve, reject) => {
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
      // Route for recording the selection
      else if (req.url === '/design-selection-result' && req.method === 'POST') {
        let body = '';
        
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            console.log(`Design selected: ${data.selectedDesign}`);
            selectedDesign = data.selectedDesign;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success', message: 'Design selection received' }));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
          }
        });
      }
      // Route for checking if selection is finalized (polling)
      else if (req.url === '/design-selection-finalized') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ finalized: selectionComplete }));
      }
      // 404 for any other routes
      else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    // Start the server
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/design-selection`);
      resolve();
    });
    
    server.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Returns the selected design
 */
export function getSelectedDesign() {
  return selectedDesign;
}

/**
 * Checks if selection process is complete
 */
export function isSelectionComplete() {
  return selectionComplete;
}

/**
 * Notifies that the selection is finalized
 */
export function notifySelectionFinalized() {
  selectionComplete = true;
}

/**
 * Stops the local server
 */
export function stopLocalServer() {
  if (server) {
    server.close();
    server = null;
    console.log('Local server stopped');
  }
} 