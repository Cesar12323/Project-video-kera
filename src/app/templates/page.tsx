"use client";

import React, { useState } from "react";
import { LayoutTemplate, Plus, Search, Sparkles, User, Box, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTemplateStore, Template } from "@/stores/templateStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TemplatesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const { getActiveAIConfig } = useSettingsStore();
    const { templates, addTemplate, removeTemplate } = useTemplateStore();

    const handleCreateComponent = async () => {
        if (!newItemName || !newItemDesc) return;

        setIsGenerating(true);
        const aiConfig = getActiveAIConfig();

        if (!aiConfig) {
            alert("Configure AI settings first!");
            setIsGenerating(false);
            return;
        }

        if (window.electronAPI) {
            try {
                await window.electronAPI.claudeGenerateComponent({
                    description: newItemDesc,
                    aiConfig
                });

                const newTemplate: Template = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: newItemName,
                    type: 'character',
                    icon: 'User',
                    content: '// AI Generated Code would go here'
                };

                addTemplate(newTemplate);
                setIsDialogOpen(false);
                setNewItemName("");
                setNewItemDesc("");
                alert("Component created and added to library!");
            } catch (e) {
                console.error(e);
                alert("Failed to generate component");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) && t.type !== 'shape'
    );

    return (
        <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutTemplate className="text-purple-400" />
                        Component Library
                    </h1>
                    <p className="text-muted-foreground mt-1">Create and manage your re-usable assets</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 h-10 px-6">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create New Asset
                </Button>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search your components..."
                    className="w-full pl-12 h-12 rounded-xl glass-input text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Create Card */}
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="aspect-square rounded-2xl glass-panel border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors group"
                >
                    <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="text-purple-400" size={32} />
                    </div>
                    <span className="font-bold text-purple-200">New AI Asset</span>
                </button>

                {/* User Templates */}
                {filteredTemplates.map((template) => (
                    <div key={template.id} className="aspect-square rounded-2xl glass-panel border border-white/10 p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all group relative">
                        <div className="flex items-start justify-between">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-300">
                                <User size={24} />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeTemplate(template.id); }}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div>
                            <h3 className="font-bold text-xl mb-1">{template.name}</h3>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded-full uppercase tracking-wider text-white/50">{template.type}</span>
                        </div>
                    </div>
                ))}

                {filteredTemplates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/20">
                        <Box size={48} className="mb-4" />
                        <p>No components found. Create one!</p>
                    </div>
                )}
            </div>

            {/* Dialog for New Component */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md glass-panel p-6 rounded-xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsDialogOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="text-purple-400" size={20} />
                            New Component
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-white/70 block mb-1">Name</label>
                                <input
                                    className="w-full glass-input rounded-lg p-2"
                                    placeholder="e.g. Hero Character"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white/70 block mb-1">Description</label>
                                <textarea
                                    className="w-full glass-input rounded-lg p-2 h-24 resize-none"
                                    placeholder="Describe the component for the AI..."
                                    value={newItemDesc}
                                    onChange={(e) => setNewItemDesc(e.target.value)}
                                />
                            </div>

                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
                                onClick={handleCreateComponent}
                                disabled={isGenerating || !newItemName || !newItemDesc}
                            >
                                {isGenerating ? "Generating..." : "Create Component"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
