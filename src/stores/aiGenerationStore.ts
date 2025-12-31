import { create } from "zustand";

// Debug: Store instance ID
const STORE_ID = `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
console.log("[AIGenerationStore] Created with ID:", STORE_ID);

interface AIGenerationState {
  // Debug
  _storeId: string;

  // Editor generation (main page)
  isGeneratingEditor: boolean;
  editorProgress: number;
  editorError: string | null;
  editorStreamedCode: string | null;

  // Component generation
  isGeneratingComponent: boolean;
  componentProgress: number;
  componentError: string | null;

  // Scene generation
  isGeneratingScene: boolean;
  sceneProgress: number;
  sceneError: string | null;

  // Editor Actions
  startEditorGeneration: () => void;
  updateEditorProgress: (progress: number) => void;
  setEditorStreamedCode: (code: string | null) => void;
  completeEditorGeneration: () => void;
  setEditorError: (error: string | null) => void;
  resetEditorGeneration: () => void;

  // Component Actions
  startComponentGeneration: () => void;
  updateComponentProgress: (progress: number) => void;
  completeComponentGeneration: () => void;
  setComponentError: (error: string | null) => void;
  resetComponentGeneration: () => void;

  // Scene Actions
  startSceneGeneration: () => void;
  updateSceneProgress: (progress: number) => void;
  completeSceneGeneration: () => void;
  setSceneError: (error: string | null) => void;
  resetSceneGeneration: () => void;
}

export const useAIGenerationStore = create<AIGenerationState>((set) => ({
  // Debug
  _storeId: STORE_ID,

  // Editor initial state
  isGeneratingEditor: false,
  editorProgress: 0,
  editorError: null,
  editorStreamedCode: null,

  // Component initial state
  isGeneratingComponent: false,
  componentProgress: 0,
  componentError: null,

  // Scene initial state
  isGeneratingScene: false,
  sceneProgress: 0,
  sceneError: null,

  // Editor actions
  startEditorGeneration: () => set({
    isGeneratingEditor: true,
    editorProgress: 0,
    editorError: null,
    editorStreamedCode: null,
  }),

  updateEditorProgress: (progress) => set({ editorProgress: progress }),

  setEditorStreamedCode: (code) => set({ editorStreamedCode: code }),

  completeEditorGeneration: () => set({
    isGeneratingEditor: false,
    editorProgress: 100,
  }),

  setEditorError: (error) => set({
    editorError: error,
    isGeneratingEditor: false,
    editorProgress: 0,
  }),

  resetEditorGeneration: () => set({
    isGeneratingEditor: false,
    editorProgress: 0,
    editorError: null,
    editorStreamedCode: null,
  }),

  // Component actions
  startComponentGeneration: () => set({
    isGeneratingComponent: true,
    componentProgress: 0,
    componentError: null,
  }),

  updateComponentProgress: (progress) => set({ componentProgress: progress }),

  completeComponentGeneration: () => set({
    isGeneratingComponent: false,
    componentProgress: 100,
  }),

  setComponentError: (error) => set({
    componentError: error,
    isGeneratingComponent: false,
    componentProgress: 0,
  }),

  resetComponentGeneration: () => set({
    isGeneratingComponent: false,
    componentProgress: 0,
    componentError: null,
  }),

  // Scene actions
  startSceneGeneration: () => set({
    isGeneratingScene: true,
    sceneProgress: 0,
    sceneError: null,
  }),

  updateSceneProgress: (progress) => set({ sceneProgress: progress }),

  completeSceneGeneration: () => set({
    isGeneratingScene: false,
    sceneProgress: 100,
  }),

  setSceneError: (error) => set({
    sceneError: error,
    isGeneratingScene: false,
    sceneProgress: 0,
  }),

  resetSceneGeneration: () => set({
    isGeneratingScene: false,
    sceneProgress: 0,
    sceneError: null,
  }),
}));
