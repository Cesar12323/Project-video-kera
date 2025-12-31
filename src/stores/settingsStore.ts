import { create } from "zustand";
import { persist } from "zustand/middleware";

// AI Provider types
export type AIProvider = "none" | "claude-cli" | "anthropic" | "openai" | "gemini" | "openrouter";

export interface OpenRouterConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AISettings {
  provider: AIProvider;
  anthropicApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  openrouterApiKey: string;
  openrouterConfig: OpenRouterConfig;
}

export interface SettingsState {
  // Output settings
  outputFolder: string;

  // Video defaults
  defaultResolution: string;
  defaultFps: number;
  defaultDuration: number;

  // Editor settings
  fontSize: number;

  // Theme
  theme: "dark" | "light";

  // AI Settings
  aiProvider: AIProvider;
  anthropicApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  geminiModel: string;
  openrouterApiKey: string;
  openrouterConfig: OpenRouterConfig;

  // n8n API Settings
  n8nInputFolder: string;
  n8nOutputFolder: string;
  n8nApiPort: number;

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  setOutputFolder: (folder: string) => void;
  setDefaultResolution: (resolution: string) => void;
  setDefaultFps: (fps: number) => void;
  setDefaultDuration: (duration: number) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: "dark" | "light") => void;
  setHasHydrated: (state: boolean) => void;

  // AI Actions
  setAIProvider: (provider: AIProvider) => void;
  setAnthropicApiKey: (key: string) => void;
  setOpenAIApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setGeminiModel: (model: string) => void;
  setOpenRouterApiKey: (key: string) => void;
  setOpenRouterConfig: (config: OpenRouterConfig) => void;
  getActiveAIConfig: () => { provider: AIProvider; apiKey: string; model?: string; config?: OpenRouterConfig } | null;

  // n8n Actions
  setN8nInputFolder: (folder: string) => void;
  setN8nOutputFolder: (folder: string) => void;
  setN8nApiPort: (port: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      outputFolder: "",
      defaultResolution: "1920x1080",
      defaultFps: 30,
      defaultDuration: 5,
      fontSize: 14,
      theme: "dark",

      // AI Settings defaults
      aiProvider: "none" as AIProvider,
      anthropicApiKey: "",
      openaiApiKey: "",
      geminiApiKey: "",
      geminiModel: "gemini-1.5-flash",
      openrouterApiKey: "",
      openrouterConfig: {
        model: "anthropic/claude-3.5-sonnet",
        maxTokens: 4096,
        temperature: 0.7,
      },

      // n8n defaults
      n8nInputFolder: "",
      n8nOutputFolder: "",
      n8nApiPort: 3333,

      _hasHydrated: false,

      // Actions
      setOutputFolder: (folder) => set({ outputFolder: folder }),
      setDefaultResolution: (resolution) => set({ defaultResolution: resolution }),
      setDefaultFps: (fps) => set({ defaultFps: fps }),
      setDefaultDuration: (duration) => set({ defaultDuration: duration }),
      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // AI Actions
      setAIProvider: (provider) => set({ aiProvider: provider }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setOpenAIApiKey: (key) => set({ openaiApiKey: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setGeminiModel: (model) => set({ geminiModel: model }),
      setOpenRouterApiKey: (key) => set({ openrouterApiKey: key }),
      setOpenRouterConfig: (config) => set({ openrouterConfig: config }),

      getActiveAIConfig: () => {
        const state = get();
        if (state.aiProvider === "none") return null;

        switch (state.aiProvider) {
          case "claude-cli":
            return { provider: state.aiProvider, apiKey: "" };
          case "anthropic":
            return state.anthropicApiKey
              ? { provider: state.aiProvider, apiKey: state.anthropicApiKey }
              : null;
          case "openai":
            return state.openaiApiKey
              ? { provider: state.aiProvider, apiKey: state.openaiApiKey }
              : null;
          case "gemini":
            return state.geminiApiKey
              ? { provider: state.aiProvider, apiKey: state.geminiApiKey, model: state.geminiModel }
              : null;
          case "openrouter":
            return state.openrouterApiKey
              ? { provider: state.aiProvider, apiKey: state.openrouterApiKey, config: state.openrouterConfig }
              : null;
          default:
            return null;
        }
      },

      // n8n Actions
      setN8nInputFolder: (folder) => set({ n8nInputFolder: folder }),
      setN8nOutputFolder: (folder) => set({ n8nOutputFolder: folder }),
      setN8nApiPort: (port) => set({ n8nApiPort: port }),
    }),
    {
      name: "project-video-settings",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        outputFolder: state.outputFolder,
        defaultResolution: state.defaultResolution,
        defaultFps: state.defaultFps,
        defaultDuration: state.defaultDuration,
        fontSize: state.fontSize,
        theme: state.theme,
        // AI Settings
        aiProvider: state.aiProvider,
        anthropicApiKey: state.anthropicApiKey,
        openaiApiKey: state.openaiApiKey,
        geminiApiKey: state.geminiApiKey,
        geminiModel: state.geminiModel,
        openrouterApiKey: state.openrouterApiKey,
        openrouterConfig: state.openrouterConfig,
        // n8n Settings
        n8nInputFolder: state.n8nInputFolder,
        n8nOutputFolder: state.n8nOutputFolder,
        n8nApiPort: state.n8nApiPort,
      }),
    }
  )
);
