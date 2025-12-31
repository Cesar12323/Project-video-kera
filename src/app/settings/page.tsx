"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { FolderOpen, Monitor, Film, Palette, Check, Globe, Sparkles, Eye, EyeOff, Upload, AlertCircle, Workflow, Copy, CheckCircle } from "lucide-react";
import { useSettingsStore, AIProvider } from "@/stores/settingsStore";
import { useLanguage, Language } from "@/stores/languageStore";

const AI_PROVIDERS: { id: AIProvider; name: string; description: string; icon: string }[] = [
  { id: "none", name: "None", description: "AI features disabled", icon: "⭘" },
  { id: "claude-cli", name: "Claude CLI (Currently Not Working)", description: "Use installed Claude CLI agent", icon: "🖥️" },
  { id: "gemini", name: "Google Gemini", description: "Gemini Pro and Ultra", icon: "💎" },
  { id: "openrouter", name: "OpenRouter", description: "Multiple models via OpenRouter", icon: "🌐" },
];

export default function SettingsPage() {
  const {
    outputFolder,
    fontSize,
    aiProvider,
    anthropicApiKey,
    openaiApiKey,
    geminiApiKey,
    geminiModel,
    openrouterApiKey,
    openrouterConfig,
    setOutputFolder,
    setFontSize,
    setAIProvider,
    setAnthropicApiKey,
    setOpenAIApiKey,
    setGeminiApiKey,
    setGeminiModel,
    setOpenRouterApiKey,
    setOpenRouterConfig,
    n8nInputFolder,
    n8nOutputFolder,
    n8nApiPort,
    setN8nInputFolder,
    setN8nOutputFolder,
    setN8nApiPort,
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [openrouterJsonError, setOpenrouterJsonError] = useState<string | null>(null);

  const { language, setLanguage, t } = useLanguage();

  const handleSelectFolder = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      const folder = await window.electronAPI.selectFolder();
      if (folder) {
        setOutputFolder(folder);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold">{t("settings.title")}</h1>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Output Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen size={18} />
                Output
              </CardTitle>
              <CardDescription>
                Configure where to save rendered videos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Default output folder
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outputFolder}
                    readOnly
                    placeholder="Same path as TSX file"
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button variant="outline" size="sm" onClick={handleSelectFolder}>
                    Browse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor size={18} />
                Editor
              </CardTitle>
              <CardDescription>
                Customize the code editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Font Size: {fontSize}px
                </label>
                <Slider
                  value={[fontSize]}
                  min={10}
                  max={24}
                  step={1}
                  onValueChange={(vals) => setFontSize(vals[0])}
                  className="w-64"
                />
              </div>
            </CardContent>
          </Card>




          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={18} />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI provider for code generation features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="text-sm text-muted-foreground mb-3 block">
                  Select AI Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AI_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setAIProvider(provider.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${aiProvider === provider.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{provider.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">{provider.description}</div>
                        </div>
                        {aiProvider === provider.id && (
                          <Check size={14} className="ml-auto text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Fields - shown based on selected provider */}
              {aiProvider === "anthropic" && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground block">
                    Anthropic API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey === "anthropic" ? "text" : "password"}
                        value={anthropicApiKey}
                        onChange={(e) => setAnthropicApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full h-9 px-3 pr-10 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(showApiKey === "anthropic" ? null : "anthropic")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey === "anthropic" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-primary hover:underline">
                      console.anthropic.com
                    </a>
                  </p>
                </div>
              )}

              {aiProvider === "openai" && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground block">
                    OpenAI API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey === "openai" ? "text" : "password"}
                        value={openaiApiKey}
                        onChange={(e) => setOpenAIApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full h-9 px-3 pr-10 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(showApiKey === "openai" ? null : "openai")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey === "openai" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-primary hover:underline">
                      platform.openai.com
                    </a>
                  </p>
                </div>
              )}

              {aiProvider === "gemini" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground block">
                      Google Gemini API Key
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey === "gemini" ? "text" : "password"}
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          placeholder="AIza..."
                          className="w-full h-9 px-3 pr-10 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(showApiKey === "gemini" ? null : "gemini")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showApiKey === "gemini" ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get your API key from{" "}
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" className="text-primary hover:underline">
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground block">
                      Gemini Model
                    </label>
                    <input
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      placeholder="gemini-1.5-flash"
                      className="w-full h-9 px-3 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Try: gemini-1.5-flash, gemini-pro, gemini-flash-latest
                    </p>
                  </div>
                </div>
              )}

              {
                aiProvider === "openrouter" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground block">
                        OpenRouter API Key
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showApiKey === "openrouter" ? "text" : "password"}
                            value={openrouterApiKey}
                            onChange={(e) => setOpenRouterApiKey(e.target.value)}
                            placeholder="sk-or-..."
                            className="w-full h-9 px-3 pr-10 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(showApiKey === "openrouter" ? null : "openrouter")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKey === "openrouter" ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get your API key from{" "}
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-primary hover:underline">
                          openrouter.ai
                        </a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground block">
                        Model Configuration (JSON)
                      </label>
                      <textarea
                        value={JSON.stringify(openrouterConfig, null, 2)}
                        onChange={(e) => {
                          try {
                            const config = JSON.parse(e.target.value);
                            setOpenRouterConfig(config);
                            setOpenrouterJsonError(null);
                          } catch {
                            setOpenrouterJsonError("Invalid JSON format");
                          }
                        }}
                        rows={5}
                        className={`w-full px-3 py-2 rounded-lg bg-secondary/80 border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono resize-none ${openrouterJsonError ? "border-red-500" : "border-border"
                          }`}
                      />
                      {openrouterJsonError && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {openrouterJsonError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Popular models: anthropic/claude-3.5-sonnet, openai/gpt-4-turbo, google/gemini-pro
                      </p>
                    </div>
                  </div>
                )
              }

              {
                aiProvider === "claude-cli" && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🖥️</span>
                      <div>
                        <p className="text-sm font-medium text-blue-400">Using Claude CLI</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Make sure you have Claude CLI installed and authenticated.
                          Run <code className="bg-secondary px-1 rounded">claude --version</code> to verify.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }

              {
                aiProvider === "none" && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-yellow-500 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-yellow-400">AI Features Disabled</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select an AI provider to enable code generation features.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
            </CardContent >
          </Card >

          {/* n8n API Integration */}
          < Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow size={18} />
                n8n API Integration
              </CardTitle>
              <CardDescription>
                Configure API settings for n8n workflow automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Status */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-green-400">API Server Running</p>
                    <p className="text-xs text-muted-foreground">
                      http://127.0.0.1:{n8nApiPort || 3333}
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Folder */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground block">
                  Default Input Folder (TSX files)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={n8nInputFolder}
                    onChange={(e) => setN8nInputFolder(e.target.value)}
                    placeholder="C:\path\to\input\folder"
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      const result = await window.electronAPI?.selectFolder();
                      if (result) setN8nInputFolder(result);
                    }}
                  >
                    <FolderOpen size={16} />
                  </Button>
                </div>
              </div>

              {/* Output Folder */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground block">
                  Default Output Folder (Video files)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={n8nOutputFolder}
                    onChange={(e) => setN8nOutputFolder(e.target.value)}
                    placeholder="C:\path\to\output\folder"
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary/80 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      const result = await window.electronAPI?.selectFolder();
                      if (result) setN8nOutputFolder(result);
                    }}
                  >
                    <FolderOpen size={16} />
                  </Button>
                </div>
              </div>

              {/* API Documentation */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground block">
                  API Endpoints
                </label>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-400">POST</span>
                      <span className="text-muted-foreground">/api/inject-file</span>
                    </div>
                    <p className="text-muted-foreground">Load TSX file and render video</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-blue-400">GET</span>
                      <span className="text-muted-foreground">/api/status</span>
                    </div>
                    <p className="text-muted-foreground">Check if app is running</p>
                  </div>
                </div>
              </div>

              {/* n8n Command Example */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground block">
                  n8n Execute Command Example
                </label>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-secondary/50 border border-border text-xs overflow-x-auto">
                    {`"<project-path>\\n8n-send.bat" "{{ $json.fileName }}" "${n8nOutputFolder || '<output-folder>'}\\video.mp4"`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `"<project-path>\\n8n-send.bat" "{{ $json.fileName }}" "${n8nOutputFolder || '<output-folder>'}\\video.mp4"`
                      );
                      setCopiedCommand(true);
                      setTimeout(() => setCopiedCommand(false), 2000);
                    }}
                  >
                    {copiedCommand ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>

              {/* Quick Guide */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-400 mb-2">Quick Setup</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Keep this app running</li>
                  <li>In n8n, save your TSX file with "Read/Write File" node</li>
                  <li>Add "Execute Command" node with the command above</li>
                  <li>Use {"{{ $json.fileName }}"} to pass the file path</li>
                </ol>
              </div>
            </CardContent>
          </Card >

          {/* Save indicator */}
          < div className="text-sm text-muted-foreground text-center py-2" >
            Settings are saved automatically
          </div >
        </div >
      </div >
    </div >
  );
}
