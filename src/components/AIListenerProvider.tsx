"use client";

import { useEffect, useRef } from "react";
import { useAIGenerationStore } from "@/stores/aiGenerationStore";

/**
 * Global AI Listener Provider
 * This component sets up IPC listeners for AI generation events ONCE
 * and keeps them alive across navigation.
 *
 * Mount this in the root layout so it never unmounts.
 */
export function AIListenerProvider({ children }: { children: React.ReactNode }) {
  const editorListenerRef = useRef<(() => void) | null>(null);
  const componentListenerRef = useRef<(() => void) | null>(null);
  const sceneListenerRef = useRef<(() => void) | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    if (typeof window === "undefined") return;

    const electronAPI = window.electronAPI;
    if (!electronAPI) return;

    initialized.current = true;
    const storeId = useAIGenerationStore.getState()._storeId;
    console.log("[AIListenerProvider] Setting up global AI listeners, storeId:", storeId);

    // Setup editor generation listener (main page AI)
    if (electronAPI.onClaudeStream && !editorListenerRef.current) {
      editorListenerRef.current = electronAPI.onClaudeStream((data) => {
        const store = useAIGenerationStore.getState();

        console.log("[AIListenerProvider] Editor stream:", data.progress, data.complete);

        store.updateEditorProgress(data.progress);

        // Stream code to store
        if (data.fullText) {
          let displayCode = data.fullText;
          const codeBlockMatch = data.fullText.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)(?:```|$)/);
          if (codeBlockMatch) {
            displayCode = codeBlockMatch[1].trim();
          }
          store.setEditorStreamedCode(displayCode);
        }

        if (data.complete) {
          store.completeEditorGeneration();

          // Dispatch event for any listening components
          window.dispatchEvent(new CustomEvent("ai-editor-generated", {
            detail: { code: store.editorStreamedCode }
          }));

          setTimeout(() => store.resetEditorGeneration(), 1500);
        }
      });
    }

    // Setup component generation listener
    if (electronAPI.onComponentStream && !componentListenerRef.current) {
      componentListenerRef.current = electronAPI.onComponentStream((data) => {
        const store = useAIGenerationStore.getState();

        console.log("[AIListenerProvider] Component stream:", data.progress, data.complete);

        store.updateComponentProgress(data.progress);

        if (data.complete && data.code) {
          store.completeComponentGeneration();

          // Store the generated code in a temporary location
          // Components page will read this when it mounts
          window.__aiGeneratedComponent = {
            code: data.code,
            meta: data.meta,
            timestamp: Date.now(),
          };

          // Dispatch custom event so any listening component can handle it
          window.dispatchEvent(new CustomEvent("ai-component-generated", {
            detail: { code: data.code, meta: data.meta }
          }));

          setTimeout(() => store.resetComponentGeneration(), 1500);
        } else if (data.complete) {
          store.resetComponentGeneration();
        }
      });
    }

    // Setup scene generation listener
    if (electronAPI.onSceneStream && !sceneListenerRef.current) {
      sceneListenerRef.current = electronAPI.onSceneStream((data) => {
        const store = useAIGenerationStore.getState();

        console.log("[AIListenerProvider] Scene stream:", data.progress, data.complete);

        store.updateSceneProgress(data.progress);

        if (data.complete && data.code) {
          store.completeSceneGeneration();

          // Store the generated code
          window.__aiGeneratedScene = {
            code: data.code,
            timestamp: Date.now(),
          };

          // Dispatch custom event
          window.dispatchEvent(new CustomEvent("ai-scene-generated", {
            detail: { code: data.code }
          }));

          setTimeout(() => store.resetSceneGeneration(), 1500);
        } else if (data.complete) {
          store.resetSceneGeneration();
        }
      });
    }

    // Don't cleanup - we want these listeners to persist!
    // They will be cleaned up when the app closes
  }, []);

  return <>{children}</>;
}

// Extend Window interface for generated content storage
declare global {
  interface Window {
    __aiGeneratedComponent?: {
      code: string;
      meta?: unknown;
      timestamp: number;
    };
    __aiGeneratedScene?: {
      code: string;
      timestamp: number;
    };
  }
}
