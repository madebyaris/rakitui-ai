#!/usr/bin/env node

/**
 * Custom MCP Build Script
 * 
 * This script builds the TypeScript files and then copies only
 * the necessary files for the MCP server to work, excluding
 * non-tool modules like prompts.
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('MCP Build Script Starting...');

// Find project root
const projectRoot = process.cwd();
console.log('Finding project root...');
console.log('Starting search from:', projectRoot);

// Step 1: Clean dist/tools
const distToolsPath = join(projectRoot, 'dist', 'tools');
if (existsSync(distToolsPath)) {
  console.log('Cleaning dist/tools...');
  rmSync(distToolsPath, { recursive: true, force: true });
}
mkdirSync(distToolsPath, { recursive: true });

// Step 2: Compile TypeScript
console.log('Running tsc in', projectRoot);
try {
  execSync('cd ' + projectRoot + ' && tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed');
  process.exit(1);
}

// Step 3: Copy only the tools directory contents to dist/tools
// Exclude the prompts directory as it's not a tool
const srcToolsPath = join(projectRoot, 'src', 'tools');
console.log('Copying tools from', srcToolsPath, 'to', distToolsPath);

function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Skip the prompts directory - it's not a tool
      if (entry.name === 'prompts') {
        console.log('  Skipping prompts directory (not a tool)');
        continue;
      }
      copyDirectory(srcPath, destPath);
    } else {
      console.log('  Copying', entry.name);
      copyFileSync(srcPath, destPath);
    }
  }
}

copyDirectory(srcToolsPath, distToolsPath);

// Step 4: Also copy the lib/prompts directory to dist/lib for runtime
const srcPromptsPath = join(projectRoot, 'src', 'prompts');
const distLibPath = join(projectRoot, 'dist', 'lib');
if (existsSync(srcPromptsPath)) {
  console.log('Creating lib directory structure...');
  mkdirSync(distLibPath, { recursive: true });
  
  console.log('Copying prompts from', srcPromptsPath, 'to', distLibPath);
  copyDirectory(srcPromptsPath, distLibPath);
}

// Step 5: Ensure dist/index.js has shebang
const indexPath = join(projectRoot, 'dist', 'index.js');
if (existsSync(indexPath)) {
  let content = readFileSync(indexPath, 'utf8');
  
  // Check if shebang exists
  if (!content.startsWith('#!/usr/bin/env node')) {
    console.log('Adding shebang to index.js...');
    content = '#!/usr/bin/env node\n' + content;
    writeFileSync(indexPath, content);
  }
}

// Step 6: Validate tools
console.log('\nValidating tools...');
const toolsPath = distToolsPath;
if (existsSync(toolsPath)) {
  const toolFiles = readdirSync(toolsPath).filter(f => f.endsWith('.js'));
  console.log(`Found ${toolFiles.length} tools in dist/tools`);
  
  // Check for DesignselectionTool.js
  if (toolFiles.includes('DesignselectionTool.js')) {
    console.log('✅ Found DesignselectionTool.js');
  } else {
    console.log('❌ DesignselectionTool.js not found');
  }
  
  // Make sure prompts is NOT in tools
  if (readdirSync(toolsPath).includes('prompts')) {
    console.log('❌ prompts directory incorrectly copied to tools');
  } else {
    console.log('✅ prompts directory correctly excluded from tools');
  }
}

console.log('Build completed successfully!');
