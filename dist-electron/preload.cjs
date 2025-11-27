"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe APIs to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getWorkingDir: () => electron_1.ipcRenderer.invoke('get-working-dir'),
    readFile: (filename) => electron_1.ipcRenderer.invoke('read-file', filename),
    writeFile: (filename, content) => electron_1.ipcRenderer.invoke('write-file', filename, content),
    listFiles: () => electron_1.ipcRenderer.invoke('list-files'),
});
