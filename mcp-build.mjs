#!/usr/bin/env node

/**
 * Custom MCP Build Script
 * 
 * This script ensures the MCP server can discover tools correctly.
 * TypeScript compiler already compiles everything to dist/, so we
 * just need to clean up .ts files and ensure proper structure.
 */

import { execSync } from 'child_process';
import { mkdirSync, readdirSync, existsSync, rmSync, readFileSync, writeFileSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('MCP Build Script Starting...');

// Find project root
const projectRoot = __dirname;
console.log('Project root:', projectRoot);

// Helper function to remove .ts files recursively
function removeTsFiles(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      console.log(`  Removing ${entryPath.replace(projectRoot + '/', '')}`);
      rmSync(entryPath);
    } else if (entry.isDirectory()) {
      removeTsFiles(entryPath);
    }
  }
}

// Step 1: Clean dist/tools - remove .ts files (keep only .js)
const distToolsPath = join(projectRoot, 'dist', 'tools');
if (existsSync(distToolsPath)) {
  console.log('Cleaning .ts files from dist/tools...');
  removeTsFiles(distToolsPath);
}

// Step 2: Clean dist/prompts - remove .ts files (keep only .js)
const distPromptsPath = join(projectRoot, 'dist', 'prompts');
if (existsSync(distPromptsPath)) {
  console.log('Cleaning .ts files from dist/prompts...');
  removeTsFiles(distPromptsPath);
}

// Step 3: Compile TypeScript
console.log('Running tsc...');
try {
  execSync('cd ' + projectRoot + ' && tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed');
  process.exit(1);
}

// Step 4: Clean dist/lib - remove .ts files (keep only .js)
const distLibPath = join(projectRoot, 'dist', 'lib');
if (existsSync(distLibPath)) {
  console.log('Cleaning .ts files from dist/lib...');
  removeTsFiles(distLibPath);
}

// Step 5: Ensure dist/index.js has shebang and execute permissions
const indexPath = join(projectRoot, 'dist', 'index.js');
if (existsSync(indexPath)) {
  let content = readFileSync(indexPath, 'utf8');
  
  if (!content.startsWith('#!/usr/bin/env node')) {
    console.log('Adding shebang to index.js...');
    content = '#!/usr/bin/env node\n' + content;
    writeFileSync(indexPath, content);
  }
  
  // Ensure execute permissions
  console.log('Setting execute permissions on index.js...');
  chmodSync(indexPath, 0o755); // rwxr-xr-x
}

// Step 6: Validate tools
console.log('\nValidating tools...');
if (existsSync(distToolsPath)) {
  const entries = readdirSync(distToolsPath, { withFileTypes: true });
  const jsFiles = entries.filter(e => e.isFile() && e.name.endsWith('.js'));
  const tsFiles = entries.filter(e => e.isFile() && e.name.endsWith('.ts'));
  
  console.log(`Found ${jsFiles.length} .js files in dist/tools`);
  
  if (tsFiles.length > 0) {
    console.log(`⚠️  Warning: Found ${tsFiles.length} .ts files (should be removed)`);
  } else {
    console.log('✅ No .ts files in dist/tools');
  }
  
  // Check for DesignselectionTool.js
  if (jsFiles.some(f => f.name === 'DesignselectionTool.js')) {
    console.log('✅ Found DesignselectionTool.js');
  } else {
    console.log('❌ DesignselectionTool.js not found');
  }
  
  // Check for prompts directory (should NOT be in tools)
  if (entries.some(e => e.isDirectory() && e.name === 'prompts')) {
    console.log('❌ prompts directory incorrectly in tools');
  } else {
    console.log('✅ prompts directory correctly excluded from tools');
  }
}

// Step 7: Validate prompts
console.log('\nValidating prompts...');
if (existsSync(distPromptsPath)) {
  const entries = readdirSync(distPromptsPath, { withFileTypes: true });
  const jsFiles = entries.filter(e => e.isFile() && e.name.endsWith('.js'));
  
  if (jsFiles.some(f => f.name === 'designPrompts.js')) {
    console.log('✅ Found dist/prompts/designPrompts.js');
  } else {
    console.log('❌ dist/prompts/designPrompts.js not found');
  }
} else {
  console.log('⚠️  dist/prompts directory not found');
}

console.log('\nBuild completed successfully!');
