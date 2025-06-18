// Test script for the improved design selection tool
import { spawn } from 'child_process';

console.log('Testing improved design selection tool...\n');

// Start the MCP server
const server = spawn('node', ['dist/index.js', '--mcp'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Handle server output
server.stdout.on('data', (data) => {
  console.log('Server:', data.toString());
});

// Wait for server to start
setTimeout(() => {
  console.log('\nSending test request...\n');
  
  // Create test request
  const request = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'designselection',
      arguments: {
        design_name_1: "Modern Card",
        design_html_1: `<div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 10px 0; color: #333;">Modern Card Design</h3>
          <p style="color: #666; line-height: 1.6;">This is a clean, modern card with subtle shadows and rounded corners.</p>
          <button style="background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Learn More</button>
        </div>`,
        design_name_2: "Gradient Card",
        design_html_2: `<div style="padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h3 style="margin: 0 0 10px 0;">Gradient Card Design</h3>
          <p style="line-height: 1.6; opacity: 0.9;">A vibrant card with a beautiful gradient background that catches the eye.</p>
          <button style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Explore</button>
        </div>`,
        design_name_3: "Minimalist Card",
        design_html_3: `<div style="padding: 20px; border: 2px solid #333; background: #fafafa;">
          <h3 style="margin: 0 0 10px 0; color: #333; font-family: monospace;">Minimalist Card</h3>
          <p style="color: #666; line-height: 1.6; font-family: monospace;">Simple. Clean. Focused on content without distractions.</p>
          <button style="background: #333; color: white; border: none; padding: 8px 16px; cursor: pointer; font-family: monospace;">→ Go</button>
        </div>`
      }
    },
    id: 1
  };
  
  // Send request to server
  server.stdin.write(JSON.stringify(request) + '\n');
  
  console.log('Request sent. Please select a design in the browser window that opened.\n');
  console.log('Features to try:');
  console.log('- Press 1, 2, or 3 for quick selection');
  console.log('- Click on a card to zoom in');
  console.log('- Click "View Code" to see the HTML');
  console.log('- The selected HTML will be copied to clipboard automatically\n');
});

// Handle server close
server.on('close', (code) => {
  console.log(`\nServer exited with code ${code}`);
  process.exit(code);
});

// Handle errors
server.on('error', (err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down test...');
  server.kill();
  process.exit(0);
}); 