"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings2 } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";

const resolutionPresets = [
  { label: "1920x1080 (Full HD)", width: 1920, height: 1080 },
  { label: "1080x1920 (Vertical)", width: 1080, height: 1920 },
  { label: "3840x2160 (4K)", width: 3840, height: 2160 },
  { label: "1280x720 (HD)", width: 1280, height: 720 },
  { label: "720x1280 (Vertical HD)", width: 720, height: 1280 },
  { label: "1080x1080 (Square)", width: 1080, height: 1080 },
];

const fpsPresets = [24, 25, 30, 60];

export function PropertiesPanel() {
  const { compositionConfig, content, setContent, markDirty } = useEditorStore();
  const contentRef = useRef(content);

  // Keep ref updated
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const [localConfig, setLocalConfig] = useState({
    id: "MyVideo",
    durationInSeconds: 5,
    fps: 30,
    width: 1920,
    height: 1080,
  });

  const [isUserEditing, setIsUserEditing] = useState(false);

  // Sync with parsed config (only when not user editing)
  useEffect(() => {
    if (compositionConfig && !isUserEditing) {
      setLocalConfig(compositionConfig);
    }
  }, [compositionConfig, isUserEditing]);

  const updateConfigInCode = (newConfig: typeof localConfig) => {
    const currentContent = contentRef.current;
    if (!currentContent) return;

    // Find and replace compositionConfig in the code
    const configRegex = /export\s+const\s+compositionConfig\s*=\s*\{[\s\S]*?\};/;
    const newConfigStr = `export const compositionConfig = {
  id: '${newConfig.id}',
  durationInSeconds: ${newConfig.durationInSeconds},
  fps: ${newConfig.fps},
  width: ${newConfig.width},
  height: ${newConfig.height},
};`;

    const updatedContent = currentContent.replace(configRegex, newConfigStr);
    if (updatedContent !== currentContent) {
      setContent(updatedContent);
      markDirty(true);
    }
  };

  // Auto-apply changes with debounce
  useEffect(() => {
    if (!isUserEditing) return;

    const timer = setTimeout(() => {
      updateConfigInCode(localConfig);
      setIsUserEditing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [localConfig, isUserEditing]);

  const handleChange = (key: keyof typeof localConfig, value: string | number) => {
    setIsUserEditing(true);
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
  };

  const handleResolutionPreset = (preset: typeof resolutionPresets[0]) => {
    setIsUserEditing(true);
    const newConfig = { ...localConfig, width: preset.width, height: preset.height };
    setLocalConfig(newConfig);
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      {/* Header */}
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Video Properties</span>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 p-3 overflow-auto space-y-3">
        {/* Resolution */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Resolution</label>
          <select
            value={`${localConfig.width}x${localConfig.height}`}
            onChange={(e) => {
              const preset = resolutionPresets.find(
                (p) => `${p.width}x${p.height}` === e.target.value
              );
              if (preset) handleResolutionPreset(preset);
            }}
            className="w-full h-8 px-2 rounded-lg glass-input text-xs"
          >
            {resolutionPresets.map((preset) => (
              <option key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Resolution */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Width</label>
            <input
              type="number"
              value={localConfig.width}
              onChange={(e) => handleChange("width", parseInt(e.target.value) || 0)}
              className="w-full h-8 px-2 rounded-lg glass-input text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Height</label>
            <input
              type="number"
              value={localConfig.height}
              onChange={(e) => handleChange("height", parseInt(e.target.value) || 0)}
              className="w-full h-8 px-2 rounded-lg glass-input text-xs"
            />
          </div>
        </div>

        {/* FPS */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Frame Rate (FPS)</label>
          <div className="flex gap-1">
            {fpsPresets.map((fps) => (
              <button
                key={fps}
                onClick={() => handleChange("fps", fps)}
                className={`flex-1 h-7 rounded-lg text-xs transition-all duration-200 ${
                  localConfig.fps === fps
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "glass-button hover:scale-105"
                }`}
              >
                {fps}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Duration (seconds)</label>
          <input
            type="number"
            value={localConfig.durationInSeconds}
            onChange={(e) => handleChange("durationInSeconds", parseFloat(e.target.value) || 1)}
            min={0.1}
            step={0.5}
            className="w-full h-8 px-2 rounded-lg glass-input text-xs"
          />
        </div>

        {/* ID */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Composition ID</label>
          <input
            type="text"
            value={localConfig.id}
            onChange={(e) => handleChange("id", e.target.value)}
            className="w-full h-8 px-2 rounded-lg glass-input text-xs"
          />
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">
          <p>Total frames: {Math.round(localConfig.durationInSeconds * localConfig.fps)}</p>
          <p>Aspect Ratio: {(localConfig.width / localConfig.height).toFixed(2)}</p>
          <p className="text-primary/70 mt-1">Changes are applied automatically</p>
        </div>
      </div>
    </div>
  );
}
