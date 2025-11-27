#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Handle --help and --version
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
SpecHelper - Visual requirements document editor

Usage:
  spec-helper [directory]    Open SpecHelper in the specified directory
  spec-helper .              Open SpecHelper in current directory
  spec-helper --help         Show this help message
  spec-helper --version      Show version

The directory should contain:
  - requirements.md
  - design.md  
  - tasks.md
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  console.log(`spec-helper v${pkg.version}`);
  process.exit(0);
}

// Get the target directory from args, default to current working directory
const targetDir = args[0] 
  ? path.resolve(process.cwd(), args[0])
  : process.cwd();

// Verify directory exists
if (!fs.existsSync(targetDir)) {
  console.error(`❌ Directory not found: ${targetDir}`);
  process.exit(1);
}

// Path to electron executable
const electronPath = path.join(rootDir, 'node_modules', '.bin', 'electron');
const mainPath = path.join(rootDir, 'dist-electron', 'main.cjs');

// Verify electron is installed
if (!fs.existsSync(electronPath)) {
  console.error('❌ Electron not found. Try reinstalling: npm install -g spec-helper');
  process.exit(1);
}

console.log(`🚀 Opening SpecHelper in: ${targetDir}`);

// Spawn electron with the target directory as argument
const child = spawn(electronPath, [mainPath, targetDir], {
  stdio: 'ignore',
  detached: true,
});

child.unref();
