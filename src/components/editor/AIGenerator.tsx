import React, { useState, useEffect } from "react";
import { Sparkles, Send, Loader2, StopCircle } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useEditorStore } from "@/stores/editorStore";
import { Button } from "@/components/ui/button";
import { useAIGenerationStore } from "@/stores/aiGenerationStore";
import { autoFixRemotionCode } from "@/lib/codeAutoFixer";

export function AIGenerator() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState("");
    const [streamedText, setStreamedText] = useState("");
    const { getActiveAIConfig } = useSettingsStore();
    const { setContent, markDirty } = useEditorStore();
    const { startEditorGeneration, completeEditorGeneration, setEditorError } = useAIGenerationStore();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Force focus on mount to ensure it works immediately if opened
    useEffect(() => {
        if (!isGenerating && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isGenerating]);

    useEffect(() => {
        // Listen for AI streaming events from Electron
        if (typeof window !== "undefined" && window.electronAPI) {
            const unsubscribe = window.electronAPI.onClaudeStream((data: any) => {
                try {
                    console.log('Received AI Stream Data:', data);
                    if (data.chunk) {
                        setStreamedText((prev) => prev + data.chunk);
                    }
                    if (data.fullText) {
                        setStreamedText(data.fullText);
                    }
                    if (data.status) {
                        setStatus(data.status);
                    }
                    if (data.complete) {
                        setIsGenerating(false);
                        setStatus("");
                        completeEditorGeneration();

                        if (data.error) {
                            console.error("AI Error from backend:", data.error);

                            // Parse and show user-friendly error message
                            let userMessage = data.error;
                            try {
                                // Try to extract the actual message from JSON error
                                if (data.error.includes('"message"')) {
                                    const jsonMatch = data.error.match(/"message":\s*"([^"]+)"/);
                                    if (jsonMatch) {
                                        userMessage = jsonMatch[1];
                                    }
                                }

                                // Handle common error types
                                if (data.error.includes('429') || data.error.includes('quota') || data.error.includes('RESOURCE_EXHAUSTED')) {
                                    userMessage = "⚠️ Rate limit exceeded!\n\nYou've reached the API quota limit. Please:\n• Wait a few minutes and try again\n• Or upgrade your API plan\n• Or switch to a different AI provider in Settings";
                                } else if (data.error.includes('401') || data.error.includes('unauthorized') || data.error.includes('UNAUTHENTICATED')) {
                                    userMessage = "❌ Invalid API Key!\n\nPlease check your API key in Settings.\nMake sure you copied the full key correctly.";
                                } else if (data.error.includes('403') || data.error.includes('forbidden')) {
                                    userMessage = "🚫 Access Denied!\n\nYour API key doesn't have permission for this model.\nCheck your API plan or try a different model.";
                                } else if (data.error.includes('404') || data.error.includes('not found')) {
                                    userMessage = "❓ Model Not Found!\n\nThe selected AI model doesn't exist.\nCheck your model name in Settings.";
                                } else if (data.error.includes('network') || data.error.includes('fetch')) {
                                    userMessage = "🌐 Network Error!\n\nCouldn't connect to the AI service.\nCheck your internet connection.";
                                }
                            } catch (e) {
                                // Keep original message if parsing fails
                            }

                            alert(`AI Error:\n\n${userMessage}`);
                            return;
                        }

                        if (data.code || data.fullText) {
                            const rawCode = data.code || data.fullText;
                            console.log('Applying code:', rawCode.substring(0, 50) + '...');

                            // Auto-Fix common AI errors
                            const fixedCode = autoFixRemotionCode(rawCode);
                            if (fixedCode !== rawCode) {
                                console.log("✨ Auto-fixed code issues (typos/comments)");
                            }

                            setContent(fixedCode);
                            markDirty(true);

                            // Show warning if AI generated incomplete code
                            if (data.warning) {
                                setTimeout(() => alert(data.warning), 500);
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error handling AI stream:", err);
                    setIsGenerating(false);
                }
            });
            return () => {
                unsubscribe();
            };
        }
    }, [setContent, markDirty, completeEditorGeneration]);

    const handleGenerate = async () => {
        console.log("Generate button clicked");
        if (!window.electronAPI) {
            alert("CRITICAL ERROR: Electron Backend Disconnected. Please restart the app.");
            return;
        }

        const aiConfig = getActiveAIConfig();
        if (!aiConfig) {
            alert("Please configure an AI provider in Settings first.");
            return;
        }

        if (!prompt.trim()) return;

        setIsGenerating(true);
        setStatus("Initializing...");
        setStreamedText("");
        startEditorGeneration();

        try {
            await (window.electronAPI as any).claudeGenerate(prompt, aiConfig);
        } catch (error) {
            console.error("Generation failed:", error);
            setIsGenerating(false);
            alert("Generation failed to start: " + error);
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* AI Warning Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-xs text-yellow-200/80">
                <span className="font-semibold">⚠️ Note:</span> AI may generate incomplete or incorrect code. Use <strong>specific, detailed prompts</strong> for better results. Always review the generated code before rendering.
            </div>

            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the animation you want to create... (e.g. 'A bouncing red ball with a shadow')"
                className="flex-1 min-h-[80px] p-3 rounded-lg glass-input text-sm resize-none relative z-50 pointer-events-auto"
                disabled={isGenerating}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.focus();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                onFocus={(e) => {
                    // Verify focus is actually here
                    console.log("AI Input Focused");
                }}
            />

            <div className="flex justify-end gap-2 relative z-50 pointer-events-auto">
                {isGenerating ? (
                    <Button variant="destructive" size="sm" onClick={() => {/* Cancel logic if available */ }}>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {status || "Generating..."}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Send className="w-3 h-3 mr-2" />
                        Generate
                    </Button>
                )}
            </div>

            {/* Tip */}
            <div className="text-[10px] text-white/30 text-center">
                Powered by {getActiveAIConfig()?.provider || "AI"}
            </div>
        </div>
    );
}
