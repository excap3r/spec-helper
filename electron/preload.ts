import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getWorkingDir: () => ipcRenderer.invoke('get-working-dir'),
  readFile: (filename: string) => ipcRenderer.invoke('read-file', filename),
  writeFile: (filename: string, content: string) => ipcRenderer.invoke('write-file', filename, content),
  listFiles: () => ipcRenderer.invoke('list-files'),
});
