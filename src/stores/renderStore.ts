import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RenderStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface RenderJob {
    id: string;
    inputPath: string;
    outputPath: string;
    status: RenderStatus;
    timestamp: number;
}

interface RenderState {
    isRendering: boolean;
    progress: number;
    currentStage: 'idle' | 'bundling' | 'rendering' | 'encoding' | 'complete' | 'error';
    error: string | null;
    history: RenderJob[];
    lastRenderedVideo: string | null;
    startRender: (job: RenderJob) => Promise<void>;
    cancelRender: () => void;
    resetRender: () => void;
    clearHistory: () => void;
    setLastRenderedVideo: (path: string | null) => void;
    addToHistory: (job: RenderJob) => void;
    updateHistoryStatus: (id: string, status: RenderStatus) => void;
    updateProgress: (progress: number) => void;
    setStage: (stage: RenderState['currentStage']) => void;
    failRender: (error: string) => void;
}

export const useRenderStore = create<RenderState>()(
    persist(
        (set, get) => ({
            isRendering: false,
            progress: 0,
            currentStage: 'idle',
            error: null,
            history: [],
            lastRenderedVideo: null,
            startRender: async (job) => {
                set({ isRendering: true, currentStage: 'bundling', progress: 0, error: null, lastRenderedVideo: null });
                console.log("Start render requested", job);
                try {
                    if (window.electronAPI?.startRender) {
                        await window.electronAPI.startRender(job);
                    } else {
                        // Fallback for browser-only dev
                        console.warn("Electron API not found");
                    }
                } catch (e: any) {
                    console.error("Render failed to start:", e);
                    set({ isRendering: false, currentStage: 'error', error: e.message });
                }
            },
            updateProgress: (progress) => set({ progress }),
            setStage: (stage) => set({ currentStage: stage }),
            failRender: (error) => set({ isRendering: false, currentStage: 'error', error }),
            cancelRender: () => {
                const history = get().history;
                const currentJob = history.find(j => j.status === 'pending' || j.status === 'processing');
                if (currentJob && window.electronAPI?.cancelRender) {
                    window.electronAPI.cancelRender(currentJob.id);
                }
                set({ isRendering: false, currentStage: 'idle', progress: 0 });
            },
            resetRender: () => {
                set({ isRendering: false, currentStage: 'idle', progress: 0, error: null });
            },
            clearHistory: () => set({ history: [] }),
            setLastRenderedVideo: (path) => set({ lastRenderedVideo: path }),
            addToHistory: (job) => {
                console.log('[RenderStore] Adding job to history:', job);
                set((state) => ({ history: [job, ...state.history] }));
            },
            updateHistoryStatus: (id, status) => {
                console.log('[RenderStore] Updating history status:', { id, status });
                const currentHistory = get().history;
                console.log('[RenderStore] Current history IDs:', currentHistory.map(j => j.id));
                set((state) => ({
                    history: state.history.map((job) => job.id === id ? { ...job, status } : job)
                }));
            },
        }),
        {
            name: 'render-store',
            partialize: (state) => ({ history: state.history }),
        }
    )
);
