#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('Testing rakitui-ai@1.0.3...');

const child = spawn('npx', ['rakitui-ai@1.0.3'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

setTimeout(() => {
  child.kill('SIGINT');
}, 5000);

child.on('close', (code) => {
  console.log('\n=== STDOUT ===');
  console.log(output);
  console.log('\n=== STDERR ===');
  console.log(errorOutput);
  console.log(`\n=== EXIT CODE: ${code} ===`);
  
  if (errorOutput.includes('Server does not support tools')) {
    console.log('❌ FAILED: Still getting tools error');
  } else if (errorOutput.includes('Server running and ready')) {
    console.log('✅ SUCCESS: Server started successfully!');
  } else if (output.includes('Starting Rakit UI AI MCP server')) {
    console.log('✅ SUCCESS: Server started (killed by timeout)');
  } else {
    console.log('⚠️  UNKNOWN: Check output above');
  }
}); 