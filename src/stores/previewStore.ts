import { create } from "zustand";

interface PreviewState {
  // Playback state
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  fps: number;

  // Preview URL (for iframe)
  previewUrl: string | null;

  // Actions
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setCurrentFrame: (frame: number) => void;
  seekTo: (frame: number) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  setTotalFrames: (frames: number) => void;
  setFps: (fps: number) => void;
  setPreviewUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  currentFrame: 0,
  totalFrames: 150, // Default: 5 seconds at 30fps
  fps: 30,
  previewUrl: null,
};

export const usePreviewStore = create<PreviewState>((set, get) => ({
  ...initialState,

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentFrame: (frame) => set({ currentFrame: frame }),

  seekTo: (frame) => {
    const { totalFrames } = get();
    const clampedFrame = Math.max(0, Math.min(frame, totalFrames - 1));
    set({ currentFrame: clampedFrame });
  },

  nextFrame: () => {
    const { currentFrame, totalFrames } = get();
    if (currentFrame < totalFrames - 1) {
      set({ currentFrame: currentFrame + 1 });
    }
  },

  prevFrame: () => {
    const { currentFrame } = get();
    if (currentFrame > 0) {
      set({ currentFrame: currentFrame - 1 });
    }
  },

  setTotalFrames: (frames) => set({ totalFrames: frames }),

  setFps: (fps) => set({ fps }),

  setPreviewUrl: (url) => set({ previewUrl: url }),

  reset: () => set(initialState),
}));
