// A simple server to serve the design selection page
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateDesignSelectionHTML } from './dist/tools/templates/designSelection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 8899;

// Sample design data
const designData = {
  design_name_1: "Modern Design",
  design_html_1: `<div style='padding: 20px; background: #f0f0f0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
    <h2 style='color: #333; font-family: Arial, sans-serif;'>Modern Design</h2>
    <p style='line-height: 1.5;'>A clean and modern design approach with subtle shadows and rounded corners.</p>
    <button style='background: #4285f4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;'>Learn More</button>
  </div>`,
  
  design_name_2: "Classic Design",
  design_html_2: `<div style='padding: 20px; background: #fff; border: 1px solid #ddd; font-family: Georgia, serif;'>
    <h2 style='color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;'>Classic Design</h2>
    <p style='line-height: 1.6; color: #666;'>A timeless classic approach with elegant typography and traditional layout.</p>
    <button style='background: #fff; color: #333; border: 1px solid #ccc; padding: 8px 16px; cursor: pointer;'>View Details</button>
  </div>`,
  
  design_name_3: "Minimalist Design",
  design_html_3: `<div style='padding: 20px; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, sans-serif;'>
    <h2 style='color: #222; font-weight: 300; letter-spacing: -0.5px;'>Minimalist Design</h2>
    <p style='color: #555; font-weight: 300;'>A simple and minimal approach focusing on essential elements and whitespace.</p>
    <button style='background: none; color: #000; border: none; border-bottom: 1px solid #000; padding: 4px 0; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; font-size: 12px;'>Explore</button>
  </div>`
};

// Generate the HTML
const htmlContent = generateDesignSelectionHTML(designData);

// Create the server
const server = http.createServer((req, res) => {
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
  
  if (req.url === '/design-selection') {
    // Serve the design selection page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.url === '/design-selection-result' && req.method === 'POST') {
    // Handle design selection result
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log(`Design selected: ${data.selectedDesign}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Design selection received' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
      }
    });
  } else {
    // 404 for everything else
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/design-selection`);
  console.log('Press Ctrl+C to stop the server.');
}); 