#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('Debugging tool discovery...');

// First, let's see what version we get
const versionChild = spawn('npx', ['rakitui-ai@latest', '--version'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

versionChild.on('close', () => {
  // Now test with debug logging
  const child = spawn('npx', ['rakitui-ai@1.0.2'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, DEBUG: '*' }
  });

  let output = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
    console.log('STDOUT:', data.toString());
  });

  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('STDERR:', data.toString());
  });

  setTimeout(() => {
    child.kill('SIGINT');
  }, 8000);

  child.on('close', (code) => {
    console.log(`\nProcess exited with code: ${code}`);
  });
}); 