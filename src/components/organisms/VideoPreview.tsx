"use client";

import React, { useEffect, useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { useRenderStore } from "@/stores/renderStore";

export function VideoPreview() {
    // We don't use content for live preview anymore as requested
    const { lastRenderedVideo } = useRenderStore();
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    useEffect(() => {
        if (lastRenderedVideo) {
            setVideoSrc(`file://${lastRenderedVideo}`);
        } else {
            setVideoSrc(null);
        }
    }, [lastRenderedVideo]);

    if (videoSrc) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center relative group">
                <video
                    key={videoSrc} // Force reload on src change
                    src={videoSrc}
                    controls
                    autoPlay
                    className="w-full h-full max-h-full object-contain"
                />
                <button
                    onClick={() => setVideoSrc(null)}
                    className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Close Video"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        );
    }

    // Default state: Black screen, no text, no player controls
    return (
        <div className="w-full h-full bg-black flex items-center justify-center">
            {/* Empty black screen as requested */}
        </div>
    );
}
