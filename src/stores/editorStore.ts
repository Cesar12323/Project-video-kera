import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompositionConfig {
  id: string;
  durationInSeconds: number;
  fps: number;
  width: number;
  height: number;
}

interface EditorState {
  // File state
  filePath: string | null;
  content: string;
  isDirty: boolean;

  // Parsed config
  compositionConfig: CompositionConfig | null;

  // Editor settings
  fontSize: number;
  theme: "dark" | "light";

  // Actions
  setFilePath: (path: string | null) => void;
  setContent: (content: string) => void;
  markDirty: (dirty: boolean) => void;
  setCompositionConfig: (config: CompositionConfig | null) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: "dark" | "light") => void;
  reset: () => void;
}

const initialState = {
  filePath: null,
  content: "",
  isDirty: false,
  compositionConfig: null,
  fontSize: 14,
  theme: "dark" as const,
};

// Parse composition config from TSX content
function parseCompositionConfig(content: string): CompositionConfig | null {
  try {
    const configMatch = content.match(
      /export\s+const\s+compositionConfig\s*=\s*(\{[\s\S]*?\});/
    );
    if (!configMatch) return null;

    const configStr = configMatch[1]
      .replace(/\/\/.*$/gm, "") // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .replace(/(\w+):/g, '"$1":'); // Quote property names

    const config = JSON.parse(configStr);

    return {
      id: config.id || "MyVideo",
      durationInSeconds: config.durationInSeconds || 5,
      fps: config.fps || 30,
      width: config.width || 1920,
      height: config.height || 1080,
    };
  } catch {
    return null;
  }
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...initialState,

      setFilePath: (path) => set({ filePath: path }),

      setContent: (content) => {
        const compositionConfig = parseCompositionConfig(content);
        set({ content, compositionConfig });
      },

      markDirty: (dirty) => set({ isDirty: dirty }),

      setCompositionConfig: (config) => set({ compositionConfig: config }),

      setFontSize: (size) => set({ fontSize: size }),

      setTheme: (theme) => set({ theme }),

      reset: () => set(initialState),
    }),
    {
      name: "editor-storage",
      partialize: (state) => ({
        fontSize: state.fontSize,
        theme: state.theme,
      }),
    }
  )
);
