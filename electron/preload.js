"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods to renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // System Paths (sync)
    getTempDir: () => electron_1.ipcRenderer.sendSync('system:getTempDir'),
    getVideosDir: () => electron_1.ipcRenderer.sendSync('system:getVideosDir'),
    getDownloadsDir: () => electron_1.ipcRenderer.sendSync('system:getDownloadsDir'),
    getHomeDir: () => electron_1.ipcRenderer.sendSync('system:getHomeDir'),
    // File Operations
    openFile: () => electron_1.ipcRenderer.invoke('file:open'),
    saveFile: (content, filePath) => electron_1.ipcRenderer.invoke('file:save', content, filePath),
    saveFileAs: (content) => electron_1.ipcRenderer.invoke('file:saveAs', content),
    readFile: (filePath) => electron_1.ipcRenderer.invoke('file:read', filePath),
    // Render Operations
    startRender: (job) => electron_1.ipcRenderer.invoke('render:start', job),
    cancelRender: (jobId) => electron_1.ipcRenderer.invoke('render:cancel', jobId),
    onRenderProgress: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('render:progress', handler);
        return () => electron_1.ipcRenderer.removeListener('render:progress', handler);
    },
    onRenderComplete: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('render:complete', handler);
        return () => electron_1.ipcRenderer.removeListener('render:complete', handler);
    },
    onRenderError: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('render:error', handler);
        return () => electron_1.ipcRenderer.removeListener('render:error', handler);
    },
    // Shell Operations
    showInFolder: (folderPath) => electron_1.ipcRenderer.invoke('shell:openFolder', folderPath),
    openExternal: (filePath) => electron_1.ipcRenderer.invoke('shell:openFile', filePath),
    // Dialog Operations
    selectFolder: () => electron_1.ipcRenderer.invoke('dialog:selectFolder'),
    // Video Operations
    getVideoDataUrl: (filePath) => electron_1.ipcRenderer.invoke('video:getDataUrl', filePath),
    // Code Injection (for n8n integration)
    onCodeInject: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('code:inject', handler);
        return () => electron_1.ipcRenderer.removeListener('code:inject', handler);
    },
    // Claude AI Generation
    claudeGenerate: (prompt) => electron_1.ipcRenderer.invoke('claude:generate', prompt),
    // Claude Streaming
    onClaudeStream: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('claude:stream', handler);
        return () => electron_1.ipcRenderer.removeListener('claude:stream', handler);
    },
    // AI Component Generation (supports multiple providers)
    claudeGenerateComponent: (data) => electron_1.ipcRenderer.invoke('claude:generateComponent', data),
    onComponentStream: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('claude:componentStream', handler);
        return () => electron_1.ipcRenderer.removeListener('claude:componentStream', handler);
    },
    // AI Scene Animation Generation (supports multiple providers)
    claudeGenerateSceneAnimation: (sceneData) => electron_1.ipcRenderer.invoke('claude:generateSceneAnimation', sceneData),
    onSceneStream: (callback) => {
        const handler = (_, data) => callback(data);
        electron_1.ipcRenderer.on('claude:sceneStream', handler);
        return () => electron_1.ipcRenderer.removeListener('claude:sceneStream', handler);
    },
});
//# sourceMappingURL=preload.js.map