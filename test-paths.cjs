#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('Testing tool discovery paths...');

// Add debug environment variable for mcp-framework
const child = spawn('npx', ['rakitui-ai@1.0.2'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { 
    ...process.env,
    NODE_DEBUG: 'mcp-framework'
  }
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString().trim());
});

child.stderr.on('data', (data) => {
  const text = data.toString().trim();
  console.log('STDERR:', text);
  
  // Look for specific debug info
  if (text.includes('Tools directory') || text.includes('tool') || text.includes('directory')) {
    console.log('🔍 TOOL DEBUG:', text);
  }
});

setTimeout(() => {
  child.kill('SIGINT');
}, 5000);

child.on('close', (code) => {
  console.log(`\nTest completed with exit code: ${code}`);
}); 