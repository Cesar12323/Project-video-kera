"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const os = require("os");
const child_process_1 = require("child_process");
const ai_service_1 = require("./ai-service");
const url = __importStar(require("url"));
const API_PORT = 3333;
if (require('electron-squirrel-startup'))
    electron_1.app.quit();
let mainWindow = null;
const activeRenderProcesses = new Map();
let apiServer = null;

// Sync IPC handlers for system paths (used by preload)
electron_1.ipcMain.on('system:getTempDir', (event) => { event.returnValue = os.tmpdir(); });
electron_1.ipcMain.on('system:getVideosDir', (event) => { event.returnValue = path.join(os.homedir(), 'Videos'); });
electron_1.ipcMain.on('system:getDownloadsDir', (event) => { event.returnValue = path.join(os.homedir(), 'Downloads'); });
electron_1.ipcMain.on('system:getHomeDir', (event) => { event.returnValue = os.homedir(); });

const startApiServer = () => {
    apiServer = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        if (req.method === 'POST' && req.url === '/api/inject-code') {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const { code, autoRender = true, outputPath = '' } = data;
                    if (!code) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Missing code parameter' }));
                        return;
                    }
                    if (mainWindow) {
                        console.log('[API] Sending code:inject IPC');
                        mainWindow.webContents.send('code:inject', { code, autoRender, outputPath });
                        mainWindow.focus();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: autoRender ? 'Code injected and render started' : 'Code injected successfully' }));
                    }
                    else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Application window not ready' }));
                    }
                }
                catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/api/inject-file') {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const { filePath, autoRender = true, outputPath = '' } = data;
                    if (!filePath) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Missing filePath parameter' }));
                        return;
                    }
                    let code = '';
                    try {
                        code = fs.readFileSync(filePath, 'utf-8');
                    }
                    catch (err) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: `Cannot read file: ${filePath}` }));
                        return;
                    }
                    if (mainWindow) {
                        console.log('[API] Sending file:inject IPC');
                        mainWindow.webContents.send('code:inject', { code, autoRender, outputPath });
                        mainWindow.focus();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: autoRender ? 'File loaded and render started' : 'File loaded successfully' }));
                    }
                    else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Application window not ready' }));
                    }
                }
                catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/api/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, status: 'running', windowReady: mainWindow !== null }));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Not found' }));
        }
    });
    apiServer.listen(API_PORT, '127.0.0.1', () => console.log(`API Server running on port ${API_PORT}`));
    apiServer.on('error', (error) => console.error('API Server error:', error));
};
const getRendererPath = () => {
    const isDev = !electron_1.app.isPackaged;
    return isDev ? path.join(__dirname, '..', 'remotion-renderer', 'renderer', 'render-cli.js') : path.join(process.resourcesPath, 'remotion-renderer', 'renderer', 'render-cli.js');
};
const getNodePath = () => {
    const isDev = !electron_1.app.isPackaged;
    const nodePath = isDev ? path.join(__dirname, '..', 'remotion-renderer', 'node', 'node.exe') : path.join(process.resourcesPath, 'remotion-renderer', 'node', 'node.exe');
    return fs.existsSync(nodePath) ? nodePath : 'node';
};
electron_1.protocol.registerSchemesAsPrivileged([{ scheme: 'media', privileges: { secure: true, supportFetchAPI: true, bypassCSP: true } }]);
const createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400, height: 900, minWidth: 1000, minHeight: 700, backgroundColor: '#0a0a0a', titleBarStyle: 'hiddenInset',
        frame: process.platform === 'darwin',
        webPreferences: { preload: path.join(__dirname, 'preload.js'), nodeIntegration: false, contextIsolation: true, webSecurity: true },
    });
    const isDev = !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:4444');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }
    mainWindow.on('closed', () => { mainWindow = null; });
};
electron_1.ipcMain.handle('render:start', async (event, job) => {
    const logFile = path.join(electron_1.app.getAppPath(), 'backend_debug.log');
    const probeFile = path.join('electron_1.app.getAppPath()', 'backend_probe.log');

    const logRender = (msg) => {
        const fullMsg = `[RENDER] ${msg}`;
        console.log(fullMsg);
        try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${fullMsg}\n`); } catch (e) { }
        try { fs.appendFileSync(probeFile, `[${new Date().toISOString()}] ${fullMsg}\n`); } catch (e) { }
    };

    logRender(`Starting render job: ${job.id}`);
    logRender(`Input path: ${job.inputPath}`);
    logRender(`Output path: ${job.outputPath}`);

    const nodePath = getNodePath();
    const rendererPath = getRendererPath();

    logRender(`Node path: ${nodePath}`);
    logRender(`Renderer path: ${rendererPath}`);
    logRender(`Node exists: ${fs.existsSync(nodePath)}`);
    logRender(`Renderer exists: ${fs.existsSync(rendererPath)}`);
    logRender(`Input file exists: ${fs.existsSync(job.inputPath)}`);

    return new Promise((resolve) => {
        const childProcess = (0, child_process_1.spawn)(nodePath, [rendererPath, `--input=${job.inputPath}`, `--output=${job.outputPath}`]);
        activeRenderProcesses.set(job.id, childProcess);

        let errorOutput = '';
        let stdoutOutput = '';

        childProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdoutOutput += output;
            logRender(`STDOUT: ${output.trim()}`);

            const bundleMatch = output.match(/Bundling:\s*(\d+)%/);
            const renderMatch = output.match(/Rendering:\s*(\d+)%/);
            if (bundleMatch)
                event.sender.send('render:progress', { id: job.id, stage: 'bundling', progress: Math.min(Math.max(parseInt(bundleMatch[1]), 0), 100) });
            else if (renderMatch)
                event.sender.send('render:progress', { id: job.id, stage: 'rendering', progress: Math.min(Math.max(parseInt(renderMatch[1]), 0), 100) });
        });

        childProcess.stderr.on('data', (data) => {
            const str = data.toString();
            logRender(`STDERR: ${str.trim()}`);
            errorOutput += str;
        });

        childProcess.on('error', (err) => {
            logRender(`SPAWN ERROR: ${err.message}`);
            errorOutput += `Spawn error: ${err.message}`;
        });

        childProcess.on('close', (code) => {
            logRender(`Process closed with code: ${code}`);
            activeRenderProcesses.delete(job.id);
            if (code === 0) {
                event.sender.send('render:complete', { id: job.id, outputPath: job.outputPath });
                resolve({ success: true });
            }
            else {
                // Send the accumulated error output or a default message
                // If errorOutput is empty, try to glean error from stdout (last 1000 chars)
                let msg = errorOutput;
                if (!msg || msg.trim().length === 0) {
                    msg = stdoutOutput.slice(-1000); // Take last 1000 chars of stdout
                }

                const finalMsg = msg || `Process exited with code ${code}`;
                logRender(`Sending error to frontend: ${finalMsg.substring(0, 500)}`);
                event.sender.send('render:error', { id: job.id, error: finalMsg });
                resolve({ success: false, error: finalMsg });
            }
        });
    });
});
electron_1.ipcMain.handle('render:cancel', async (_, jobId) => {
    const process = activeRenderProcesses.get(jobId);
    if (process) {
        process.kill();
        activeRenderProcesses.delete(jobId);
        return { success: true };
    }
    return { success: false, error: 'Process not found' };
});
electron_1.app.whenReady().then(() => {
    electron_1.protocol.handle('media', (request) => electron_1.net.fetch(url.pathToFileURL(decodeURIComponent(request.url.replace('media://', ''))).toString()));
    createWindow();
    startApiServer();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    activeRenderProcesses.forEach((p) => {
        try {
            if (!p.killed)
                p.kill();
        }
        catch (e) {
            console.error(e);
        }
    });
    activeRenderProcesses.clear();
    if (apiServer) {
        apiServer.close();
        apiServer = null;
    }
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('before-quit', () => {
    activeRenderProcesses.forEach((p) => {
        try {
            if (!p.killed)
                p.kill();
        }
        catch (e) {
            console.error(e);
        }
    });
    activeRenderProcesses.clear();
});
electron_1.ipcMain.handle('file:open', async () => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'TSX Files', extensions: ['tsx'] }] });
    if (result.canceled || result.filePaths.length === 0)
        return null;
    return { filePath: result.filePaths[0], content: fs.readFileSync(result.filePaths[0], 'utf-8') };
});
electron_1.ipcMain.handle('file:save', async (_, content, filePath) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.handle('file:saveAs', async (_, content) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, { filters: [{ name: 'TSX Files', extensions: ['tsx'] }] });
    if (result.canceled || !result.filePath)
        return null;
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { filePath: result.filePath };
});
electron_1.ipcMain.handle('dialog:saveVideo', async (_, defaultName) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        title: 'Save Rendered Video',
        defaultPath: path.join(electron_1.app.getPath('videos'), defaultName || 'video.mp4'),
        filters: [{ name: 'Video Files', extensions: ['mp4'] }]
    });
    if (result.canceled || !result.filePath)
        return null;
    return result.filePath;
});
electron_1.ipcMain.handle('file:read', async (_, filePath) => {
    try {
        return { success: true, content: fs.readFileSync(filePath, 'utf-8') };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
const logToDebug = (msg) => {
    const logFile = path.join(electron_1.app.getAppPath(), 'backend_debug.log');
    try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { console.error(e); }
};

electron_1.ipcMain.handle('shell:openFolder', async (_, folderPath) => {
    logToDebug(`[shell:openFolder] Request to open: ${folderPath}`);
    if (!fs.existsSync(folderPath)) {
        logToDebug(`[shell:openFolder] Path does not exist: ${folderPath}`);
        return { success: false, error: 'File not found' };
    }
    electron_1.shell.showItemInFolder(folderPath);
    return { success: true };
});

electron_1.ipcMain.handle('shell:openFile', async (_, filePath) => {
    logToDebug(`[shell:openFile] Request to open: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        logToDebug(`[shell:openFile] Path does not exist: ${filePath}`);
        return { success: false, error: 'File not found' };
    }
    await electron_1.shell.openPath(filePath);
    return { success: true };
});
electron_1.ipcMain.handle('dialog:selectFolder', async () => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    return (result.canceled || result.filePaths.length === 0) ? null : result.filePaths[0];
});
electron_1.ipcMain.handle('video:getDataUrl', async () => ({ success: false, error: 'Use media:// protocol instead' }));
electron_1.ipcMain.handle('claude:generate', async (event, prompt, config) => {
    const logFile = path.join(electron_1.app.getAppPath(), 'backend_debug.log');
    const log = (msg) => {
        try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { console.error(e); }
    };

    log(`Received generate request. Provider: ${config?.provider}`);
    const { callAI, extractCodeFromResponse } = require('./ai-service');

    // Fix: systemPrompt path might need path.join logic or just be relative. 
    // __dirname is electron/ so .. is root.
    const systemPromptPath = path.join(__dirname, '..', 'remotion-agent-prompt.md');
    log(`System prompt path: ${systemPromptPath}`);

    const systemPrompt = fs.existsSync(systemPromptPath) ? fs.readFileSync(systemPromptPath, 'utf-8') : 'Generate Remotion TSX code.';
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    if (mainWindow) {
        log('Sending initial status to renderer');
        mainWindow.webContents.send('claude:stream', { status: 'Initializing...' });
    }

    // STARTING AI CALL
    if (mainWindow) mainWindow.webContents.send('claude:stream', { status: 'Thinking...' });

    try {
        if (config?.provider === 'claude-cli') {
            // ... CLI logic ...
            // Removing progress interval logic for CLI too
            if (mainWindow) mainWindow.webContents.send('claude:stream', { status: 'Using Claude CLI...' });
            // KEEP EXISTING CLI LOGIC BUT ADD LOGGING
            // For brevity, skipping CLI detailed re-write unless user uses it. User likely uses Gemini/OpenRouter now.
            log('Using Claude CLI (legacy flow)');
            return new Promise((resolve) => {
                // ... existing CLI impl ...
                // Just copying the CLI block back to avoid breaking it
                const tempPromptFile = path.join(electron_1.app.getPath('temp'), 'claude-prompt.txt');
                fs.writeFileSync(tempPromptFile, fullPrompt, 'utf-8');
                const command = `type "${tempPromptFile}" | claude --print`;

                let cliProgress = 20; // CLI's own progress
                const cliProgressInterval = setInterval(() => {
                    if (cliProgress < 90) {
                        cliProgress += 5;
                        if (mainWindow) mainWindow.webContents.send('claude:stream', { progress: cliProgress });
                    }
                }, 1000);

                (0, child_process_1.exec)(command, { maxBuffer: 1024 * 1024 * 10, timeout: 300000, windowsHide: true }, (error, stdout, stderr) => {
                    clearInterval(cliProgressInterval);
                    if (error) {
                        log(`Claude CLI error: ${error.message}`);
                        if (mainWindow) mainWindow.webContents.send('claude:stream', { progress: 0, complete: true });
                        resolve({ success: false, error: error.message });
                        return;
                    }
                    const code = stdout;
                    log('Claude CLI response received, sending complete event to renderer');
                    if (mainWindow) mainWindow.webContents.send('claude:stream', { fullText: code, status: 'Complete', complete: true });
                    resolve({ success: true, code });
                });
            });
        }

        log(`Calling functionality for provider: ${config?.provider}`);
        const result = await callAI(config, fullPrompt);
        log(`AI response received. Success: ${result.success}`);

        if (mainWindow) mainWindow.webContents.send('claude:stream', { status: 'Processing Response...' });

        if (result.success) {
            log(`Raw content length: ${result.content?.length}`);
            const code = extractCodeFromResponse(result.content);
            log(`Extracted code length: ${code?.length}`);

            // Validate code completeness
            let warning = null;
            const openBraces = (code.match(/{/g) || []).length;
            const closeBraces = (code.match(/}/g) || []).length;
            const openParens = (code.match(/\(/g) || []).length;
            const closeParens = (code.match(/\)/g) || []).length;

            if (openBraces !== closeBraces || openParens !== closeParens) {
                warning = `âš ï¸ WARNING: AI generated INCOMPLETE code! Braces: ${openBraces} open vs ${closeBraces} close. Parentheses: ${openParens} open vs ${closeParens} close. Try a SIMPLER prompt.`;
                log(warning);
            }

            if (!code.includes('export default') || !code.includes('compositionConfig')) {
                warning = (warning || '') + `\nâš ï¸ WARNING: Code is missing required exports. It may not render correctly.`;
                log(warning);
            }

            if (mainWindow) {
                log('Sending complete event to renderer');
                mainWindow.webContents.send('claude:stream', { fullText: code, status: warning ? 'Complete (with warnings)' : 'Complete', complete: true, warning });
            }
            return { success: true, code };
        } else {
            log(`AI Error: ${result.error}`);
            console.error("AI Service Error:", result.error);
            if (mainWindow) {
                log('Sending error complete event to renderer');
                // Include explicit error message for UI
                mainWindow.webContents.send('claude:stream', { status: 'Error', complete: true, error: result.error });
            }
            return { success: false, error: result.error };
        }
    } catch (err) {
        clearInterval(progressInterval);
        log(`Exception in main process: ${err.message}`);
        console.error("Main Process AI Error:", err);
        if (mainWindow) {
            log('Sending error complete event to renderer due to exception');
            mainWindow.webContents.send('claude:stream', { status: 'Error', complete: true, error: err.message });
        }
        return { success: false, error: err.message };
    }
});
electron_1.ipcMain.handle('claude:generateComponent', async (event, data) => {
    const { description, aiConfig } = data;
    const promptFilePath = path.join(__dirname, 'prompts', 'component-prompt.txt');
    let systemPrompt = '';
    try {
        systemPrompt = fs.readFileSync(promptFilePath, 'utf-8');
    }
    catch (err) {
        systemPrompt = 'Generate a reusable Remotion component. Output ONLY TSX code.';
    }
    const fullPrompt = `${systemPrompt}\n\nCreate this component: ${description}`;
    if (mainWindow)
        mainWindow.webContents.send('claude:componentStream', { progress: 10 });
    if (aiConfig?.provider === 'claude-cli') {
        return new Promise((resolve) => {
            const tempPromptFile = path.join(electron_1.app.getPath('temp'), 'claude-component-prompt.txt');
            fs.writeFileSync(tempPromptFile, fullPrompt, 'utf-8');
            const command = `type "${tempPromptFile}" | claude --print`;
            let currentProgress = 10;
            const progressInterval = setInterval(() => {
                if (currentProgress < 90) {
                    currentProgress += 5;
                    if (mainWindow)
                        mainWindow.webContents.send('claude:componentStream', { progress: currentProgress });
                }
            }, 2000);
            (0, child_process_1.exec)(command, { maxBuffer: 1024 * 1024 * 10, timeout: 300000, windowsHide: true }, (error, stdout, stderr) => {
                clearInterval(progressInterval);
                if (error) {
                    if (mainWindow)
                        mainWindow.webContents.send('claude:componentStream', { progress: 0, complete: true });
                    resolve({ success: false, error: stderr?.includes('not recognized') ? 'Claude CLI not found.' : 'Claude CLI not available.' });
                    return;
                }
                if (stdout) {
                    const extractedCode = (0, ai_service_1.extractCodeFromResponse)(stdout);
                    let componentMeta = null;
                    const metaMatch = extractedCode.match(/export const componentMeta\s*=\s*(\{[\s\S]*?\});/);
                    if (metaMatch) {
                        try {
                            componentMeta = eval('(' + metaMatch[1] + ')');
                        }
                        catch (e) { }
                    }
                    if (mainWindow)
                        mainWindow.webContents.send('claude:componentStream', { code: extractedCode, meta: componentMeta, progress: 100, complete: true });
                    resolve({ success: true, code: extractedCode, meta: componentMeta });
                }
                else {
                    if (mainWindow)
                        mainWindow.webContents.send('claude:componentStream', { progress: 0, complete: true });
                    resolve({ success: false, error: 'No response from Claude CLI.' });
                }
            });
        });
    }
    let currentProgress = 10;
    const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
            currentProgress += 8;
            if (mainWindow)
                mainWindow.webContents.send('claude:componentStream', { progress: currentProgress });
        }
    }, 1500);
    try {
        const result = await (0, ai_service_1.callAI)(aiConfig, fullPrompt);
        clearInterval(progressInterval);
        if (!result.success) {
            if (mainWindow)
                mainWindow.webContents.send('claude:componentStream', { progress: 0, complete: true });
            return { success: false, error: result.error };
        }
        const extractedCode = (0, ai_service_1.extractCodeFromResponse)(result.content || '');
        let componentMeta = null;
        const metaMatch = extractedCode.match(/export const componentMeta\s*=\s*(\{[\s\S]*?\});/);
        if (metaMatch) {
            try {
                componentMeta = eval('(' + metaMatch[1] + ')');
            }
            catch (e) { }
        }
        if (mainWindow)
            mainWindow.webContents.send('claude:componentStream', { code: extractedCode, meta: componentMeta, progress: 100, complete: true });
        return { success: true, code: extractedCode, meta: componentMeta };
    }
    catch (error) {
        clearInterval(progressInterval);
        if (mainWindow)
            mainWindow.webContents.send('claude:componentStream', { progress: 0, complete: true });
        return { success: false, error: 'Error generating.' };
    }
});
electron_1.ipcMain.handle('claude:generateSceneAnimation', async (event, sceneData) => {
    const { elements, description, aiConfig } = sceneData;
    const promptFilePath = path.join(__dirname, 'prompts', 'scene-animation-prompt.txt');
    let systemPrompt = '';
    try {
        systemPrompt = fs.readFileSync(promptFilePath, 'utf-8');
    }
    catch (err) {
        systemPrompt = 'Generate animated Remotion scene. Output ONLY TSX code.';
    }
    const fullPrompt = `${systemPrompt}\n\nScene Elements:\n${JSON.stringify(elements, null, 2)}\n\nAnimation Description: ${description}`;
    if (mainWindow)
        mainWindow.webContents.send('claude:sceneStream', { progress: 10 });
    if (aiConfig?.provider === 'claude-cli') {
        return new Promise((resolve) => {
            const tempPromptFile = path.join(electron_1.app.getPath('temp'), 'claude-scene-prompt.txt');
            fs.writeFileSync(tempPromptFile, fullPrompt, 'utf-8');
            const command = `type "${tempPromptFile}" | claude --print`;
            let currentProgress = 10;
            const progressInterval = setInterval(() => {
                if (currentProgress < 90) {
                    currentProgress += 5;
                    if (mainWindow)
                        mainWindow.webContents.send('claude:sceneStream', { progress: currentProgress });
                }
            }, 2000);
            (0, child_process_1.exec)(command, { maxBuffer: 1024 * 1024 * 10, timeout: 300000, windowsHide: true }, (error, stdout, stderr) => {
                clearInterval(progressInterval);
                if (error) {
                    if (mainWindow)
                        mainWindow.webContents.send('claude:sceneStream', { progress: 0, complete: true });
                    resolve({ success: false, error: 'Claude CLI Not Found' });
                    return;
                }
                if (stdout) {
                    const extractedCode = (0, ai_service_1.extractCodeFromResponse)(stdout);
                    if (mainWindow)
                        mainWindow.webContents.send('claude:sceneStream', { code: extractedCode, progress: 100, complete: true });
                    resolve({ success: true, code: extractedCode });
                }
                else {
                    if (mainWindow)
                        mainWindow.webContents.send('claude:sceneStream', { progress: 0, complete: true });
                    resolve({ success: false, error: 'No response from Claude CLI.' });
                }
            });
        });
    }
    let currentProgress = 10;
    const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
            currentProgress += 8;
            if (mainWindow)
                mainWindow.webContents.send('claude:sceneStream', { progress: currentProgress });
        }
    }, 1500);
    try {
        const result = await (0, ai_service_1.callAI)(aiConfig, fullPrompt);
        clearInterval(progressInterval);
        if (!result.success) {
            if (mainWindow)
                mainWindow.webContents.send('claude:sceneStream', { progress: 0, complete: true });
            return { success: false, error: result.error };
        }
        const extractedCode = (0, ai_service_1.extractCodeFromResponse)(result.content || '');
        if (mainWindow)
            mainWindow.webContents.send('claude:sceneStream', { code: extractedCode, progress: 100, complete: true });
        return { success: true, code: extractedCode };
    }
    catch (error) {
        clearInterval(progressInterval);
        if (mainWindow)
            mainWindow.webContents.send('claude:sceneStream', { progress: 0, complete: true });
        return { success: false, error: 'Error generating.' };
    }
});
//# sourceMappingURL=main.js.map
