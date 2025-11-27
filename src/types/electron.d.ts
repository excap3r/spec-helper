export interface ElectronAPI {
  getWorkingDir: () => Promise<string>;
  readFile: (filename: string) => Promise<string | null>;
  writeFile: (filename: string, content: string) => Promise<boolean>;
  listFiles: () => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
