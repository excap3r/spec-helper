#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Get the target directory from args, default to current working directory
const targetDir = process.argv[2] 
  ? path.resolve(process.cwd(), process.argv[2])
  : process.cwd();

// Path to electron executable
const electronPath = path.join(rootDir, 'node_modules', '.bin', 'electron');
const mainPath = path.join(rootDir, 'dist-electron', 'main.cjs');

console.log(`Opening SpecHelper in: ${targetDir}`);

// Spawn electron with the target directory as argument
const child = spawn(electronPath, [mainPath, targetDir], {
  stdio: 'inherit',
  detached: true,
});

child.unref();
