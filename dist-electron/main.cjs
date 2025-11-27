"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const appRoot = path_1.default.resolve(__dirname, '..');
let mainWindow = null;
let workingDir = process.cwd();
// Parse CLI arguments - get the directory path
const args = process.argv.slice(electron_1.app.isPackaged ? 1 : 2);
if (args.length > 0 && !args[0].startsWith('-')) {
    const inputPath = args[0];
    workingDir = path_1.default.isAbsolute(inputPath) ? inputPath : path_1.default.resolve(process.cwd(), inputPath);
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.cjs'),
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
    }
    else {
        const indexPath = path_1.default.join(appRoot, 'dist', 'index.html');
        mainWindow.loadFile(indexPath);
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// IPC handlers for file operations
electron_1.ipcMain.handle('get-working-dir', () => workingDir);
electron_1.ipcMain.handle('read-file', async (_event, filename) => {
    const filePath = path_1.default.join(workingDir, filename);
    try {
        if (fs_1.default.existsSync(filePath)) {
            return fs_1.default.readFileSync(filePath, 'utf-8');
        }
        return null;
    }
    catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
});
electron_1.ipcMain.handle('write-file', async (_event, filename, content) => {
    const filePath = path_1.default.join(workingDir, filename);
    try {
        fs_1.default.writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
});
electron_1.ipcMain.handle('list-files', async () => {
    try {
        const files = fs_1.default.readdirSync(workingDir);
        return files.filter(f => f.endsWith('.md'));
    }
    catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
});
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
