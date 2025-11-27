#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Check if we need to build (dist doesn't exist or is empty)
const distPath = path.join(rootDir, 'dist', 'index.html');
const electronPath = path.join(rootDir, 'dist-electron', 'main.cjs');

if (!fs.existsSync(distPath) || !fs.existsSync(electronPath)) {
  console.log('📦 Building SpecHelper...');
  
  try {
    // Check if we have source files (dev install vs published package)
    const hasSrc = fs.existsSync(path.join(rootDir, 'src'));
    
    if (hasSrc) {
      execSync('npm run build && npm run electron:compile', { 
        cwd: rootDir, 
        stdio: 'inherit' 
      });
      console.log('✅ SpecHelper built successfully!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║                    SpecHelper Installed!                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Usage:                                                    ║
║    spec-helper .              Open current directory       ║
║    spec-helper /path/to/spec  Open specific directory      ║
║                                                            ║
║  The directory should contain:                             ║
║    - requirements.md                                       ║
║    - design.md                                             ║
║    - tasks.md                                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
