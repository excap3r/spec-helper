import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

const appRoot = path.resolve(__dirname, '..');

let mainWindow: BrowserWindow | null = null;
let workingDir: string = process.cwd();

// Parse CLI arguments - get the directory path
const args = process.argv.slice(app.isPackaged ? 1 : 2);
if (args.length > 0 && !args[0].startsWith('-')) {
  const inputPath = args[0];
  workingDir = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#020617', // slate-950
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(appRoot, 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for file operations
ipcMain.handle('get-working-dir', () => workingDir);

ipcMain.handle('read-file', async (_event, filename: string) => {
  const filePath = path.join(workingDir, filename);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
});

ipcMain.handle('write-file', async (_event, filename: string, content: string) => {
  const filePath = path.join(workingDir, filename);
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
});

ipcMain.handle('list-files', async () => {
  try {
    const files = fs.readdirSync(workingDir);
    return files.filter(f => f.endsWith('.md'));
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
