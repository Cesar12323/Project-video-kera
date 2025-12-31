"use client";

import React, { useEffect } from "react";
import { ListVideo, CheckCircle2, AlertCircle, Loader2, FolderOpen, Ban, Play, Trash2 } from "lucide-react";
import { useRenderStore } from "@/stores/renderStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QueuePage() {
    const { currentStage, progress, isRendering, error, history, clearHistory } = useRenderStore();

    useEffect(() => {
        console.log("[Queue] History updated, now has", history.length, "items:", history.map(h => ({ id: h.id, status: h.status, output: h.outputPath })));
    }, [history]);

    const handleOpenFolder = (path: string) => {
        console.log("[Queue] handleOpenFolder called with path:", path);
        if (window.electronAPI && window.electronAPI.showInFolder) {
            console.log("[Queue] Calling showInFolder...");
            window.electronAPI.showInFolder(path);
        } else {
            alert("Error: Electron API not available. Please restart the app.");
        }
    };

    const handlePlayVideo = (path: string) => {
        console.log("[Queue] handlePlayVideo called with path:", path);
        if (window.electronAPI && window.electronAPI.openExternal) {
            console.log("[Queue] Calling openExternal...");
            window.electronAPI.openExternal(path);
        } else {
            alert("Error: Electron API not available. Please restart the app.");
        }
    };

    return (
        <div className="p-8 h-full flex flex-col max-w-6xl mx-auto">
            {/* ... Header and Active Job Section (keep existing) ... */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ListVideo className="text-purple-500" size={32} />
                        Render Queue
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">Manage and monitor your video export jobs</p>
                </div>
                <Button variant="ghost" className="text-muted-foreground hover:text-red-400 gap-2" onClick={() => {
                    if (confirm("Are you sure you want to clear the render history?")) clearHistory();
                }}>
                    <Trash2 size={16} />
                    Clear History
                </Button>
            </div>

            {/* Active Job Section */}
            <div className="mb-10">
                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Current Job</h2>
                <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden p-1 shadow-2xl shadow-black/50">
                    {isRendering ? (
                        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-xl flex items-center gap-6">
                            <div className="h-16 w-16 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/10">
                                <Loader2 className="animate-spin text-purple-400" size={32} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-xl truncate">Rendering Project...</h3>
                                    <span className="text-sm font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 capitalize">
                                        {currentStage}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                        <span>{progress}% Complete</span>
                                        <span>Tasks: Bundling &rarr; Rendering &rarr; Encoding</span>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 pl-4 border-l border-white/10 ml-4">
                                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-12 w-12 rounded-xl p-0">
                                    <Ban size={24} />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <ListVideo size={32} className="opacity-50" />
                            </div>
                            <h3 className="font-medium text-lg text-white/70">No active render jobs</h3>
                            <p>Start a render from the Editor to see progress here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Section */}
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Recent History</h2>

            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 bg-black/20">
                {/* Headings */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    <div className="col-span-6">File Name</div> {/* Expanded to 6 */}
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3 text-right">Actions</div> {/* Expanded to 3 */}
                </div>

                {/* Real Data from History */}
                {history.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No render history available yet.
                    </div>
                ) : (
                    history.slice().reverse().map((item) => {
                        // Extract filename from outputPath for display
                        const fileName = item.outputPath.split(/[\\/]/).pop() || 'Unknown File';

                        return (
                            <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-colors group">
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={18} className="text-green-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium truncate text-white/90" title={item.outputPath}>{fileName}</div>
                                        <div className="text-xs text-muted-foreground truncate">{new Date(item.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
                                        item.status === 'completed' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        {item.status === 'completed' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        {item.status === 'completed' ? 'Completed' : 'Failed'}
                                    </span>
                                </div>


                                <div className="col-span-3 flex justify-end">
                                    {item.status === 'completed' && item.outputPath.includes('\\') ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-transparent border-white/20 hover:bg-white/10 h-8 mr-2"
                                                onClick={() => handlePlayVideo(item.outputPath)}
                                            >
                                                <Play size={14} className="mr-2" />
                                                Play
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-transparent border-white/20 hover:bg-white/10 h-8"
                                                onClick={() => handleOpenFolder(item.outputPath)}
                                            >
                                                <FolderOpen size={14} className="mr-2" />
                                                Folder
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">No file available</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
