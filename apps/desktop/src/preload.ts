import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  onFolderSelected: (callback: (folderPath: string) => void) => {
    ipcRenderer.on('folder-selected', (_, folderPath) => callback(folderPath));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});