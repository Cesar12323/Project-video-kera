import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Types
export interface FileOpenResult {
  filePath: string;
  content: string;
}

export interface RenderJob {
  id: string;
  inputPath: string;
  outputPath: string;
}

export interface RenderProgress {
  id: string;
  stage: 'bundling' | 'rendering';
  progress: number;
}

export interface RenderComplete {
  id: string;
  outputPath: string;
}

export interface RenderError {
  id: string;
  error: string;
}

export interface CodeInjectData {
  code: string;
  autoRender: boolean;
  outputPath?: string;
}

export interface ClaudeStreamData {
  chunk: string;
  fullText: string;
  progress: number;
  complete?: boolean;
}

export interface ComponentStreamData {
  code?: string;
  meta?: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  progress: number;
  complete?: boolean;
}

export interface SceneStreamData {
  code?: string;
  progress: number;
  complete?: boolean;
}

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // System Paths (sync)
  getTempDir: (): string => ipcRenderer.sendSync('system:getTempDir'),
  getVideosDir: (): string => ipcRenderer.sendSync('system:getVideosDir'),
  getDownloadsDir: (): string => ipcRenderer.sendSync('system:getDownloadsDir'),
  getHomeDir: (): string => ipcRenderer.sendSync('system:getHomeDir'),

  // File Operations
  openFile: (): Promise<FileOpenResult | null> =>
    ipcRenderer.invoke('file:open'),

  saveFile: (content: string, filePath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('file:save', content, filePath),

  saveFileAs: (content: string): Promise<{ filePath: string } | null> =>
    ipcRenderer.invoke('file:saveAs', content),

  readFile: (filePath: string): Promise<{ success: boolean; content?: string; error?: string }> =>
    ipcRenderer.invoke('file:read', filePath),

  // Render Operations
  startRender: (job: RenderJob): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('render:start', job),

  cancelRender: (jobId: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('render:cancel', jobId),

  onRenderProgress: (callback: (data: RenderProgress) => void) => {
    const handler = (_: IpcRendererEvent, data: RenderProgress) => callback(data);
    ipcRenderer.on('render:progress', handler);
    return () => ipcRenderer.removeListener('render:progress', handler);
  },

  onRenderComplete: (callback: (data: RenderComplete) => void) => {
    const handler = (_: IpcRendererEvent, data: RenderComplete) => callback(data);
    ipcRenderer.on('render:complete', handler);
    return () => ipcRenderer.removeListener('render:complete', handler);
  },

  onRenderError: (callback: (data: RenderError) => void) => {
    const handler = (_: IpcRendererEvent, data: RenderError) => callback(data);
    ipcRenderer.on('render:error', handler);
    return () => ipcRenderer.removeListener('render:error', handler);
  },

  // Shell Operations
  showInFolder: (folderPath: string): Promise<void> =>
    ipcRenderer.invoke('shell:openFolder', folderPath),

  openExternal: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('shell:openFile', filePath),

  // Dialog Operations
  selectFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:selectFolder'),

  // Video Operations
  getVideoDataUrl: (filePath: string): Promise<{ success: boolean; dataUrl?: string; error?: string }> =>
    ipcRenderer.invoke('video:getDataUrl', filePath),

  // Code Injection (for n8n integration)
  onCodeInject: (callback: (data: CodeInjectData) => void) => {
    const handler = (_: IpcRendererEvent, data: CodeInjectData) => callback(data);
    ipcRenderer.on('code:inject', handler);
    return () => ipcRenderer.removeListener('code:inject', handler);
  },

  // Claude AI Generation
  claudeGenerate: (prompt: string): Promise<{ success: boolean; code?: string; error?: string }> =>
    ipcRenderer.invoke('claude:generate', prompt),

  // Claude Streaming
  onClaudeStream: (callback: (data: ClaudeStreamData) => void) => {
    const handler = (_: IpcRendererEvent, data: ClaudeStreamData) => callback(data);
    ipcRenderer.on('claude:stream', handler);
    return () => ipcRenderer.removeListener('claude:stream', handler);
  },

  // AI Component Generation (supports multiple providers)
  claudeGenerateComponent: (data: { description: string; aiConfig: unknown }): Promise<{ success: boolean; code?: string; meta?: unknown; error?: string }> =>
    ipcRenderer.invoke('claude:generateComponent', data),

  onComponentStream: (callback: (data: ComponentStreamData) => void) => {
    const handler = (_: IpcRendererEvent, data: ComponentStreamData) => callback(data);
    ipcRenderer.on('claude:componentStream', handler);
    return () => ipcRenderer.removeListener('claude:componentStream', handler);
  },

  // AI Scene Animation Generation (supports multiple providers)
  claudeGenerateSceneAnimation: (sceneData: { elements: unknown[]; description: string; aiConfig: unknown }): Promise<{ success: boolean; code?: string; error?: string }> =>
    ipcRenderer.invoke('claude:generateSceneAnimation', sceneData),

  onSceneStream: (callback: (data: SceneStreamData) => void) => {
    const handler = (_: IpcRendererEvent, data: SceneStreamData) => callback(data);
    ipcRenderer.on('claude:sceneStream', handler);
    return () => ipcRenderer.removeListener('claude:sceneStream', handler);
  },
});

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      getTempDir: () => string;
      getVideosDir: () => string;
      getDownloadsDir: () => string;
      getHomeDir: () => string;
      openFile: () => Promise<FileOpenResult | null>;
      saveFile: (content: string, filePath: string) => Promise<{ success: boolean; error?: string }>;
      saveFileAs: (content: string) => Promise<{ filePath: string } | null>;
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      startRender: (job: RenderJob) => Promise<{ success: boolean; error?: string }>;
      cancelRender: (jobId: string) => Promise<{ success: boolean; error?: string }>;
      onRenderProgress: (callback: (data: RenderProgress) => void) => () => void;
      onRenderComplete: (callback: (data: RenderComplete) => void) => () => void;
      onRenderError: (callback: (data: RenderError) => void) => () => void;
      showInFolder: (folderPath: string) => Promise<void>;
      openExternal: (filePath: string) => Promise<void>;
      selectFolder: () => Promise<string | null>;
      getVideoDataUrl: (filePath: string) => Promise<{ success: boolean; dataUrl?: string; error?: string }>;
      onCodeInject: (callback: (data: CodeInjectData) => void) => () => void;
      claudeGenerate: (prompt: string) => Promise<{ success: boolean; code?: string; error?: string }>;
      onClaudeStream: (callback: (data: ClaudeStreamData) => void) => () => void;
      claudeGenerateComponent: (data: { description: string; aiConfig: unknown }) => Promise<{ success: boolean; code?: string; meta?: unknown; error?: string }>;
      onComponentStream: (callback: (data: ComponentStreamData) => void) => () => void;
      claudeGenerateSceneAnimation: (sceneData: { elements: unknown[]; description: string; aiConfig: unknown }) => Promise<{ success: boolean; code?: string; error?: string }>;
      onSceneStream: (callback: (data: SceneStreamData) => void) => () => void;
    };
  }
}
