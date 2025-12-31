"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Play, Save, Copy } from "lucide-react";
import { useRenderStore } from "@/stores/renderStore";
import { useEditorStore } from "@/stores/editorStore";

import { diagnoseRenderError, formatDiagnosisForAlert } from "@/lib/errorDiagnostics";

export function EditorToolbar() {
    const { startRender, isRendering, addToHistory, updateProgress, setStage, resetRender, progress, updateHistoryStatus, failRender, setLastRenderedVideo } = useRenderStore();
    const { filePath, content, setFilePath } = useEditorStore();

    // Listen to Render Events
    React.useEffect(() => {
        if (!window.electronAPI) return;

        const u1 = window.electronAPI.onRenderProgress((data: any) => {
            updateProgress(data.progress);
            if (data.stage) setStage(data.stage);
        });

        const u2 = window.electronAPI.onRenderComplete((data: any) => {
            console.log("[EditorToolbar] Render complete event received:", data);
            updateProgress(100);
            setStage('complete');
            if (data.id) {
                console.log("[EditorToolbar] Updating history status for ID:", data.id);
                updateHistoryStatus(data.id, 'completed');
            } else {
                console.warn("[EditorToolbar] No ID in complete event, cannot update history");
            }

            // Set for playback
            setLastRenderedVideo(data.outputPath);

            setTimeout(() => {
                resetRender();
                // Removed alert to avoid blocking playback flow if desired, or keep it. Let's keep it but maybe notify less intrusively?
                // For now, keeping alert as per user expectation basically
                alert(`Rendering Completed! Video saved to: ${data.outputPath}`);
            }, 500);
        });

        const u3 = window.electronAPI.onRenderError((data: any) => {
            failRender(data.error);
            if (data.id) updateHistoryStatus(data.id, 'failed');

            // Diagnose error
            const diagnosis = diagnoseRenderError(data.error);
            alert(formatDiagnosisForAlert(diagnosis));
        });

        return () => {
            if (u1) u1();
            if (u2) u2();
            if (u3) u3();
        };
    }, [updateProgress, setStage, resetRender]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            alert("Code copied to clipboard!");
        } catch (err) {
            // Fallback for when document is not focused
            const textArea = document.createElement("textarea");
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("Code copied to clipboard!");
        }
    };

    const handleSave = async () => {
        if (!window.electronAPI) return;

        if (filePath) {
            const result = await window.electronAPI.saveFile(content, filePath);
            if (result.success) {
                console.log("File saved");
            } else {
                alert("Error saving file: " + result.error);
            }
        } else {
            const result = await window.electronAPI.saveFileAs(content);
            if (result && result.filePath) {
                setFilePath(result.filePath);
            }
        }
    };

    const handleExport = async () => {
        if (isRendering) return;

        if (!window.electronAPI) {
            alert("CRITICAL ERROR: Electron Backend Disconnected. Please restart the app.");
            return;
        }

        // Basic code validation
        const validateCode = (code: string): { valid: boolean; error?: string } => {
            if (!code || code.trim().length === 0) {
                return { valid: false, error: "Editor is empty. Please add some code first." };
            }

            // Check for compositionConfig export
            if (!code.includes('export const compositionConfig')) {
                return { valid: false, error: "Missing 'export const compositionConfig'. This is required for rendering." };
            }

            // Check for balanced braces (basic syntax check)
            const openBraces = (code.match(/{/g) || []).length;
            const closeBraces = (code.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                return { valid: false, error: `Unbalanced braces detected: ${openBraces} opening vs ${closeBraces} closing. Code may be incomplete.` };
            }

            // Check for balanced parentheses
            const openParens = (code.match(/\(/g) || []).length;
            const closeParens = (code.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                return { valid: false, error: `Unbalanced parentheses detected: ${openParens} opening vs ${closeParens} closing. Code may be incomplete.` };
            }

            // Check for default export
            if (!code.includes('export default')) {
                return { valid: false, error: "Missing 'export default'. The main component must be exported." };
            }

            return { valid: true };
        };

        const validation = validateCode(content);
        if (!validation.valid) {
            alert(`⚠️ Code Validation Failed:\n\n${validation.error}\n\nPlease fix the code before rendering.`);
            return;
        }

        let renderInputPath = filePath;

        // Auto-save logic: silent save if file exists, else save to temp/default
        if (window.electronAPI) {
            if (filePath) {
                const res = await window.electronAPI.saveFile(content, filePath);
                if (!res.success) {
                    alert("Autosave failed: " + res.error);
                    return;
                }
            } else {
                // If unsaved, save to a temporary location for rendering
                // Using system temp directory for cross-platform compatibility
                const tempDir = (window.electronAPI as any)?.getTempDir?.() || '/tmp';
                renderInputPath = `${tempDir}\\temp_project_render.tsx`;
                const res = await window.electronAPI.saveFile(content, renderInputPath);
                if (!res.success) {
                    alert("Temp save failed: " + res.error);
                    return;
                }
            }
        }

        // Ask user where to save the video
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const defaultName = `Video_${timestamp}.mp4`;

        let outputPath: string | null = null;
        if ((window.electronAPI as any)?.showSaveVideoDialog) {
            outputPath = await (window.electronAPI as any).showSaveVideoDialog(defaultName);
            if (!outputPath) {
                // User cancelled
                return;
            }
        } else {
            // Fallback to default path using system videos directory
            const videosDir = (window.electronAPI as any)?.getVideosDir?.() || '/tmp';
            outputPath = `${videosDir}\\${defaultName}`;
        }

        const jobId = crypto.randomUUID();
        const newJob = {
            id: jobId,
            inputPath: renderInputPath || "temp.tsx",
            outputPath: outputPath,
            status: 'pending' as const,
            timestamp: Date.now()
        };

        addToHistory(newJob);
        // Set to processing immediately
        updateHistoryStatus(jobId, 'processing');

        // Initiate REAL render via Electron
        await startRender(newJob);
    };

    return (
        <div className="h-14 border-b border-white/5 bg-background/50 flex items-center justify-between px-4 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Project VIDEO KERA (alpha V0.1)
                </span>
            </div>

            <div className="flex items-center gap-2">
                {isRendering && (
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                        <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-white" onClick={handleCopy}>
                    <Copy size={16} />
                    Copy
                </Button>
                <Button
                    size="sm"
                    className="h-9 gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                    onClick={handleExport}
                    disabled={isRendering}
                >
                    <Download size={16} />
                    {isRendering ? 'Rendering...' : 'Rendering'}
                </Button>
            </div>
        </div>
    );
}
