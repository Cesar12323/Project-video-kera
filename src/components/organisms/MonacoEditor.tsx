"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/stores/editorStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Loader2 } from "lucide-react";

export function MonacoEditor() {
    const { content, setContent, isDirty, markDirty } = useEditorStore();
    const { fontSize, theme } = useSettingsStore();

    // Handle editor change
    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setContent(value);
            markDirty(true);
        }
    };

    return (
        <div className="w-full h-full bg-[#1e1e1e] relative group">
            <Editor
                height="100%"
                defaultLanguage="typescript"
                path="composition.tsx"
                theme="vs-dark"
                value={content}
                onChange={handleEditorChange}
                loading={<div className="flex items-center gap-2 text-white/50 p-4"><Loader2 className="animate-spin" /> Loading Editor...</div>}
                options={{
                    fontSize: fontSize || 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                    fontLigatures: true,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                }}
            />
            {isDirty && (
                <div className="absolute bottom-4 right-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Unsaved Changes
                </div>
            )}
        </div>
    );
}
