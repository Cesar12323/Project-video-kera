"use client";

import React, { useState } from "react";
import { MonacoEditor } from "@/components/organisms/MonacoEditor";
import { VideoPreview } from "@/components/organisms/VideoPreview";
import { EditorToolbar } from "@/components/organisms/EditorToolbar";
import { PropertiesPanel } from "@/components/organisms/PropertiesPanel";
import { AIGenerator } from "@/components/editor/AIGenerator";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export default function EditorPage() {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 isolate">
          {/* AI Generator Toggle */}
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center justify-between px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/70">AI Generator</span>
            </div>
            {showAI ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </button>

          {/* AI Generator Panel */}
          {showAI && (
            <div className="p-3 border-b border-white/5 relative z-50 bg-[#0a0a0a] shadow-xl">
              <AIGenerator />
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 overflow-hidden relative z-0">
            <MonacoEditor />
          </div>
        </div>

        {/* Right Panel: Preview + Properties */}
        <div className="w-[400px] flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 border-b border-white/5">
            <VideoPreview />
          </div>

          {/* Properties Panel */}
          <div className="h-[200px]">
            <PropertiesPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
