export { };

declare global {
    interface Window {
        electronAPI: {
            // System Paths
            getTempDir: () => string;
            getVideosDir: () => string;
            getDownloadsDir: () => string;
            getHomeDir: () => string;

            // File Operations
            openFile: () => Promise<any>;
            saveFile: (content: string, filePath: string) => Promise<{ success: boolean; error?: string }>;
            saveFileAs: (content: string) => Promise<{ filePath: string } | null>;
            readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
            startRender: (job: any) => Promise<any>;
            cancelRender: (jobId: string) => Promise<any>;
            onRenderProgress: (callback: (data: any) => void) => () => void;
            onRenderComplete: (callback: (data: any) => void) => () => void;
            onRenderError: (callback: (data: any) => void) => () => void;
            showInFolder: (folderPath: string) => Promise<void>;
            openExternal: (filePath: string) => Promise<void>;
            selectFolder: () => Promise<string | null>;
            showSaveVideoDialog: (defaultName: string) => Promise<string | null>;
            getVideoDataUrl: (filePath: string) => Promise<{ success: boolean; error?: string }>;
            onCodeInject: (callback: (data: any) => void) => () => void;

            // AI Methods
            claudeGenerate: (prompt: string, config?: any) => Promise<any>;
            onClaudeStream: (callback: (data: any) => void) => () => void;

            claudeGenerateComponent: (data: { description: string; aiConfig: any }) => Promise<any>;
            onComponentStream: (callback: (data: any) => void) => () => void;

            claudeGenerateSceneAnimation: (data: { elements: any[]; description: string; aiConfig: any }) => Promise<any>;
            onSceneStream: (callback: (data: any) => void) => () => void;
        };
    }
}
