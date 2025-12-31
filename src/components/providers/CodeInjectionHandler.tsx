"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { useRenderStore } from "@/stores/renderStore";
import { autoFixRemotionCode } from "@/lib/codeAutoFixer";
import * as path from "path";

// Generate temp file path for auto-render
function generateTempFilePath(): string {
  const timestamp = Date.now();
  // Use system temp directory - works cross-platform
  // In browser context, we'll use a generic temp path that Electron will handle
  const tempDir = window.electronAPI?.getTempDir?.() ||
    (typeof process !== 'undefined' ? process.env.TEMP || process.env.TMP || '/tmp' : '/tmp');
  return `${tempDir}\\n8n-animation-${timestamp}.tsx`;
}

export function CodeInjectionHandler() {
  const { setContent, setFilePath, markDirty } = useEditorStore();
  const { startRender, isRendering } = useRenderStore();
  const isHandlingRef = useRef(false);

  useEffect(() => {
    // Only run in Electron environment
    if (typeof window === "undefined" || !window.electronAPI?.onCodeInject) {
      return;
    }

    const unsubscribe = window.electronAPI.onCodeInject(async (data) => {
      // Prevent duplicate handling
      if (isHandlingRef.current) {
        console.log("Already handling code injection, skipping...");
        return;
      }

      isHandlingRef.current = true;

      try {
        const { code: rawCode, autoRender, outputPath } = data;
        // Ensure code is a string
        const rawCodeStr = typeof rawCode === 'string' ? rawCode : String(rawCode);
        console.log("Code injection received:", { codeLength: rawCodeStr.length, autoRender, outputPath });

        // ✨ AUTO-FIX common AI errors before using the code
        const code = autoFixRemotionCode(rawCodeStr);
        if (code !== rawCodeStr) {
          console.log("✨ Auto-fixed N8N code issues (typos/comments)");
        }

        // Update editor with sanitized code
        setContent(code);
        markDirty(true);

        if (autoRender && !isRendering) {
          // Save to temp file and render
          const tempPath = generateTempFilePath();

          try {
            // Save the code to temp file
            const saveResult = await window.electronAPI.saveFile(code, tempPath);

            if (saveResult.success) {
              setFilePath(tempPath);
              markDirty(false);

              // Wait a small delay to ensure file is written
              await new Promise((resolve) => setTimeout(resolve, 100));

              // Generate default output path if not provided - use system videos folder
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
              const videosDir = window.electronAPI?.getVideosDir?.() ||
                (typeof process !== 'undefined' ? process.env.USERPROFILE + '\\Videos' : '/tmp');
              const finalOutputPath = outputPath || `${videosDir}\\n8n_Video_${timestamp}.mp4`;

              // Construct proper job object
              const job = {
                id: crypto.randomUUID(),
                inputPath: tempPath,
                outputPath: finalOutputPath,
                status: 'pending' as const,
                timestamp: Date.now()
              };

              console.log("Auto-render starting with job:", job);
              startRender(job);
            } else {
              console.error("Failed to save temp file:", saveResult.error);
            }
          } catch (error) {
            console.error("Error during auto-render:", error);
          }
        }
      } finally {
        // Reset handling flag after a short delay
        setTimeout(() => {
          isHandlingRef.current = false;
        }, 1000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setContent, setFilePath, markDirty, startRender, isRendering]);

  // This component doesn't render anything
  return null;
}
