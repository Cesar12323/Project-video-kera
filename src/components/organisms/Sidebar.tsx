"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileVideo, LayoutTemplate, ListVideo, Clapperboard, Settings, Sparkles, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/languageStore";
import { useAIGenerationStore } from "@/stores/aiGenerationStore";
import { useRenderStore } from "@/stores/renderStore";

const items = [
    { href: "/", icon: FileVideo, labelKey: "sidebar.editor" },
    { href: "/queue", icon: ListVideo, labelKey: "sidebar.queue" },
    { href: "/settings", icon: Settings, labelKey: "sidebar.settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguageStore();
    const [isConnected, setIsConnected] = useState(false);

    // Global status from stores
    const { isGeneratingEditor } = useAIGenerationStore();
    const { isRendering, progress } = useRenderStore();

    useEffect(() => {
        // Check connection on client side only
        setIsConnected(!!window.electronAPI);
    }, []);

    return (
        <div className="w-16 h-full glass-panel border-r border-border/50 flex flex-col items-center py-4 gap-4 z-50 bg-background/80 backdrop-blur-md">
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const label = t(item.labelKey);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        )}
                    >
                        <Icon size={20} />
                        <span className="absolute left-16 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border/50 z-[100] shadow-md">
                            {label}
                        </span>
                    </Link>
                );
            })}

            {/* Global Status Indicators */}
            <div className="mt-auto flex flex-col items-center gap-2 mb-2">
                {/* AI Generation Status */}
                {isGeneratingEditor && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 animate-pulse" title="AI Generating...">
                        <Sparkles size={14} className="text-purple-400" />
                    </div>
                )}

                {/* Rendering Status */}
                {isRendering && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50" title={`Rendering: ${Math.round(progress)}%`}>
                        <Loader2 size={14} className="text-blue-400 animate-spin" />
                    </div>
                )}

                {/* Connection Status */}
                <div title="Backend Connection Status">
                    <div className={cn("w-3 h-3 rounded-full", isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 animate-pulse")} />
                </div>
            </div>
        </div>
    );
}
