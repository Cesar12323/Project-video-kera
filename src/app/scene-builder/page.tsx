"use client";

import React, { useState, useEffect } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor
} from "@dnd-kit/core";
import { Circle, Square, Triangle, Sparkles, Plus, Trash2, Grip, Layers, ZoomIn, ZoomOut, Grid as GridIcon, Code, ExternalLink, Type, Image as ImageIcon, Box, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useTemplateStore, Template } from "@/stores/templateStore";
import { cn } from "@/lib/utils";

// --- Types ---
type SceneItem = {
    uniqueId: string;
    templateId?: string;
    x: number;
    y: number;
    name: string;
    type: string;
};

// --- Components ---

// 1. General Draggable Asset Item (for visual mockups like Backgrounds, Text, Effects)
function DraggableAssetItem({ name, type, icon: Icon, color }: { name: string, type: string, icon: any, color?: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `asset-static-${name}`,
        data: { type: 'asset', template: { id: `static-${name}`, name, type, icon: 'Static' } },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing group",
                isDragging && "opacity-50"
            )}
        >
            <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center transition-all border border-white/5",
                color ? color : "bg-white/5 text-white/70 hover:bg-white/10"
            )}>
                <Icon size={20} />
            </div>
            <span className="text-[10px] text-white/50 group-hover:text-white/90 truncate w-full text-center px-1">{name}</span>
        </div>
    );
}

// 2. Specialized Helper for Templates (Shapes) with specific styles
function DraggableTemplateAsset({ type, filter, color, bgColor }: { type: string, filter: string, color: string, bgColor: string }) {
    const { templates } = useTemplateStore();
    // Find the template (mocking one if not found for the UI to always show)
    const template = templates.find(t => t.name === filter) || { id: `mock-${filter}`, name: filter, type: 'shape', icon: filter, content: '' };

    // We reuse the basic DraggableAsset logic but wrapper
    return <DraggableAsset template={template as Template} customClass={cn(color, bgColor)} />;
}


// 3. Existing DraggableAsset (Modified to accept custom styling)
function DraggableAsset({ template, customClass }: { template: Template, customClass?: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `asset-${template.id}`,
        data: { type: 'asset', template },
    });

    const Icon = getIconComp(template.icon);

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing group",
                isDragging && "opacity-50"
            )}
        >
            <div className={cn(
                "h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all",
                customClass ? customClass : "group-hover:bg-purple-500/20 group-hover:border-purple-500/50"
            )}>
                <Icon className={cn("text-white/70", !customClass && "group-hover:text-purple-300")} size={20} />
            </div>
            <span className="text-[10px] text-white/50 group-hover:text-white/90 truncate w-full text-center px-1">{template.name}</span>
        </div>
    );
}

// 4. Draggable Canvas Item (On Stage)
const CanvasItem = React.memo(function CanvasItem({ item, selected, onSelect, scale }: { item: SceneItem, selected: boolean, onSelect: () => void, scale: number }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.uniqueId,
        data: { type: 'canvas-item', item },
    });

    const style: React.CSSProperties = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : {};

    const Icon = getIconComp(item.name);

    return (
        <div
            ref={setNodeRef}
            style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                ...style,
                touchAction: 'none' // Important for preventing browser interruptions
            }}
            className={cn(
                "flex items-center justify-center cursor-grab active:cursor-grabbing group",
                isDragging && "z-50 opacity-80"
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            {...listeners}
            {...attributes}
        >
            {/* 
                User requested "ONLY the raw object" without background/border.
                We only show a dashed border when SELECTED for UI feedback.
             */}
            <div className={cn(
                "p-2 rounded-xl transition-all flex items-center justify-center",
                selected ? "border-2 border-dashed border-purple-500" : "border-2 border-transparent hover:border-white/10"
            )}>
                {/* Icon size increased to look like a 'prop' */}
                <Icon size={64} className={cn("text-white drop-shadow-md", getCustomColor(item.name))} />
            </div>
        </div>
    );
}, (prev, next) => {
    // Custom comparison for performance optimization
    return (
        prev.item.x === next.item.x &&
        prev.item.y === next.item.y &&
        prev.selected === next.selected &&
        prev.scale === next.scale &&
        prev.item.uniqueId === next.item.uniqueId
    );
});

// Helper for custom colors based on name to add variety without boxes
function getCustomColor(name: string) {
    if (name.includes('Stella')) return "text-yellow-400";
    if (name.includes('Cuore')) return "text-red-400";
    if (name.includes('Particelle')) return "text-green-400";
    if (name.includes('Glow')) return "text-blue-400";
    return "text-white";
}

function getIconComp(name: string) {
    // Loose matching for icons
    if (name.includes('Circle')) return Circle;
    if (name.includes('Triangl')) return Triangle;
    if (name.includes('Square')) return Square;
    if (name.includes('Rect')) return Square;
    if (name.includes('User')) return Sparkles;
    if (name.includes('Text') || name.includes('Titolo')) return Type;
    if (name.includes('Image') || name.includes('Sfond')) return ImageIcon;
    if (name.includes('Stella') || name.includes('Star')) return Sparkles;
    if (name.includes('Sun') || name.includes('Glow')) return Sun;
    return Box;
}

export default function SceneBuilderPage() {
    const [items, setItems] = useState<SceneItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [zoom, setZoom] = useState([50]); // 50% default
    const [showGrid, setShowGrid] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { templates } = useTemplateStore();
    const { getActiveAIConfig } = useSettingsStore();
    const { t } = useLanguageStore(); // Localization Hook

    // Optimize sensor to prevent accidental drags (3px tolerance) but remain responsive
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 3,
        },
    }));

    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const handleDragStart = (event: any) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveDragItem(null);
        const type = active.data.current?.type;

        if (!over) return;

        const canvasElement = document.getElementById('main-canvas');
        if (!canvasElement) return;
        const canvasRect = canvasElement.getBoundingClientRect();
        const currentScale = zoom[0] / 100;

        // 1. Dropping NEW Asset
        if (type === 'asset' && over.id === 'canvas-droppable') {
            const template = active.data.current?.template as Template;

            // "Dropping into Scene":
            // We want to place it where the mouse released it relative to the canvas.
            // Since we don't have the exact mouse coords easily in this context without `useDroppable` refs,
            // we estimate based on the center + delta. 
            // Better approach: assume start drag was from sidebar. Delta is movement.
            // To make it feel "perfect", we'd need screen coordinates, but for now:
            // CENTER OF SCREEN (roughly) + DELTA is a better approximation than "100 + delta".
            // Let's position it centrally relative to the view port, then apply delta.

            // Assuming 1280x720 canvas is centered.
            // Let's create it at the drop location more naturally.
            // Note: delta is pixel diff from start. Start was in sidebar.
            // We'll place it at `delta` - but we need to account for sidebar offset.
            // A simple "safe" spawn is often center (640, 360) + a fraction of delta if visual correlation is weak.
            // BUT user wants "less rigid". "Rigid" usually means locking to a grid or 100,100.
            // Let's try to map it closer to the cursor. 
            // Since we can't easily map exact screen-to-canvas-SVG coords here without more math:
            // We'll spawn it at the CANVAS CENTER, then let them move it.
            // OR: A generic "Spawn Point" + Delta.

            // @ts-ignore
            const droppedRect = active.rect.current.translated;

            if (droppedRect) {
                const localX = (droppedRect.left - canvasRect.left) / currentScale;
                const localY = (droppedRect.top - canvasRect.top) / currentScale;

                const newItem: SceneItem = {
                    uniqueId: Math.random().toString(36).substr(2, 9),
                    templateId: template.id,
                    x: localX,
                    y: localY,
                    name: template.name,
                    type: template.type
                };
                setItems([...items, newItem]);
            }
        }

        // 2. Moving EXISTING Item
        if (type === 'canvas-item') {
            const id = active.id as string;
            // @ts-ignore
            const droppedRect = active.rect.current.translated;

            if (droppedRect) {
                const localX = (droppedRect.left - canvasRect.left) / currentScale;
                const localY = (droppedRect.top - canvasRect.top) / currentScale;

                setItems(items => items.map(item => {
                    if (item.uniqueId === id) {
                        return {
                            ...item,
                            x: localX,
                            y: localY
                        };
                    }
                    return item;
                }));
            }
        }
    };

    const removeElement = (id: string) => {
        setItems(items.filter(i => i.uniqueId !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const handleGenerate = async () => {
        // ... existing generation logic ...
        alert("Generating code... (Placeholder action)");
    };

    if (!isMounted) return null;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden font-sans">

                {/* TOP TOOLBAR */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-bold flex items-center gap-2">
                            <Layers className="text-purple-500" size={18} />
                            Scene Builder
                        </h1>
                        <div className="h-4 w-px bg-white/10" />

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12 text-right">Zoom:</span>
                            <ZoomOut size={14} className="text-muted-foreground" />
                            <Slider
                                value={zoom}
                                onValueChange={setZoom}
                                min={10}
                                max={200}
                                step={10}
                                className="w-24"
                            />
                            <span className="text-xs text-muted-foreground w-8">{zoom}%</span>
                            <ZoomIn size={14} className="text-muted-foreground" />
                        </div>

                        <div className="h-4 w-px bg-white/10" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", showGrid ? "bg-white/10 text-white" : "text-muted-foreground")}
                            onClick={() => setShowGrid(!showGrid)}
                        >
                            <GridIcon size={16} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent border-white/20 text-xs">
                            <Code size={14} />
                            Mostra Codice
                        </Button>
                        <Button size="sm" className="h-8 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
                            <ExternalLink size={14} />
                            Apri nell'Editor
                        </Button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex flex-1 overflow-hidden">

                    {/* CENTER - CANVAS (Viewport) */}
                    <div
                        className="flex-1 bg-[#050505] relative overflow-hidden flex items-center justify-center p-10"
                        style={{
                            // Dot Grid Implementation - Cleaner and more "Pro"
                            backgroundImage: showGrid ? `radial-gradient(circle, #333 1.5px, transparent 1.5px)` : 'none',
                            backgroundSize: showGrid ? `${30 * (zoom[0] / 100)}px ${30 * (zoom[0] / 100)}px` : 'auto', // Tighter grid
                            backgroundPosition: 'center'
                        }}
                    >
                        <CanvasDroppable
                            items={items}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            scale={zoom[0] / 100}
                            showGrid={false} // Grid handled by parent now
                        />
                    </div>

                    {/* RIGHT SIDEBAR - ASSETS & LAYERS */}
                    <div className="w-80 border-l border-white/10 bg-[#0a0a0a] flex flex-col z-20">
                        {/* ... Sidebar Content ... */}


                        {/* Top Half: Assets */}
                        <div className="flex-1 flex flex-col min-h-0 border-b border-white/10">
                            <div className="p-4 pb-0">
                                <h2 className="text-xs font-bold text-white/90 mb-4">{t('scene.dragToScene')}</h2>
                            </div>

                            <div className="px-4 pb-4 space-y-6 overflow-y-auto custom-scrollbar">

                                {/* Sfondi (Backgrounds) - Blue */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-white/40 uppercase mb-2 flex items-center gap-2">
                                        <ImageIcon size={10} /> {t('scene.backgrounds')}
                                    </h3>
                                    {/* Unified to grid-cols-3 for cleaner look */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <DraggableAssetItem name={t('item.gradient')} type="background" icon={ImageIcon} color="bg-blue-500" />
                                        <DraggableAssetItem name={t('item.dark')} type="background" icon={Box} color="bg-slate-700" />
                                    </div>
                                </div>

                                {/* Forme (Shapes) - Purple - 3D UPDATE */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-white/40 uppercase mb-2 flex items-center gap-2">
                                        <Box size={10} /> {t('scene.shapes')}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Cube (Box) */}
                                        <DraggableAssetItem name={t('item.cube')} type="shape" icon={Box} color="bg-purple-500/20 text-purple-400" />
                                        {/* Sphere (Circle) */}
                                        <DraggableAssetItem name={t('item.sphere')} type="shape" icon={Circle} color="bg-purple-500/20 text-purple-400" />
                                        {/* Pyramid (Triangle) */}
                                        <DraggableAssetItem name={t('item.pyramid')} type="shape" icon={Triangle} color="bg-purple-500/20 text-purple-400" />
                                        {/* Star */}
                                        <DraggableAssetItem name={t('item.star')} type="shape" icon={Sparkles} color="bg-yellow-500/20 text-yellow-400" />
                                    </div>
                                </div>

                                {/* Testo (Text) - White/Zinc */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-white/40 uppercase mb-2 flex items-center gap-2">
                                        <Type size={10} /> {t('scene.text')}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <DraggableAssetItem name={t('item.title')} type="text" icon={Type} color="bg-zinc-800 text-white" />
                                        <DraggableAssetItem name={t('item.body')} type="text" icon={Type} color="bg-zinc-800/50 text-white/70" />
                                    </div>
                                </div>

                                {/* Effetti (Effects) - Green */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-white/40 uppercase mb-2 flex items-center gap-2">
                                        <Sparkles size={10} /> {t('scene.effects')}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <DraggableAssetItem name={t('item.particles')} type="effect" icon={Sparkles} color="bg-green-500/20 text-green-400" />
                                        <DraggableAssetItem name={t('item.glow')} type="effect" icon={Sun} color="bg-green-500/20 text-green-400" />

                                        {/* User Components */}
                                        {templates.filter(t => t.type !== 'shape').map(t => (
                                            <DraggableAsset key={t.id} template={t} />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Bottom Half: Layers */}
                        <div className="h-1/3 min-h-[200px] flex flex-col bg-[#0f0f0f]">
                            <div className="p-3 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-white/90 flex items-center gap-2">
                                    <Layers size={14} />
                                    {t('scene.layers')} ({items.length})
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {items.slice().reverse().map((item, index) => {
                                    const Icon = getIconComp(item.name);
                                    return (
                                        <div
                                            key={item.uniqueId}
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-lg text-xs cursor-pointer group hover:bg-white/5 border border-transparent",
                                                selectedId === item.uniqueId ? "bg-white/5 border-white/10 text-white" : "text-white/50"
                                            )}
                                            onClick={() => setSelectedId(item.uniqueId)}
                                        >
                                            <Grip size={12} className="text-white/20 cursor-move" />
                                            <div className="h-6 w-6 rounded bg-white/5 flex items-center justify-center">
                                                <Icon size={14} className="text-white/70" />
                                            </div>
                                            <span className="flex-1 truncate font-medium">{item.name} {index + 1}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeElement(item.uniqueId); }}
                                                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
                                {items.length === 0 && (
                                    <div className="text-center py-8 text-white/20 text-[10px]">
                                        {t('scene.dragHere')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.8' } } }) }}>
                {activeDragItem ? (
                    <div className="cursor-grabbing">
                        {/* If dragging an asset, show just the Icon/Text without box */}
                        {activeDragItem.type === 'asset' && (
                            <div className="flex flex-col items-center gap-2">
                                {/* We get the icon based on the template name */}
                                {(() => {
                                    const Icon = getIconComp(activeDragItem.template.name);
                                    // Make it larger and cleaner (no background box)
                                    return <Icon size={64} className={cn("text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]", getCustomColor(activeDragItem.template.name))} />;
                                })()}
                            </div>
                        )}
                        {activeDragItem.type === 'canvas-item' && (
                            // Match exact structure of CanvasItem
                            <div className="flex items-center justify-center" style={{ width: 'min-content', height: 'min-content' }}>
                                <div className={cn(
                                    "p-2 rounded-xl flex items-center justify-center border-2 border-transparent", // Simulated unselected state
                                )}>
                                    {(() => {
                                        const Icon = getIconComp(activeDragItem.item.name);
                                        return <Icon size={64} className={cn("text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]", getCustomColor(activeDragItem.item.name))} />;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext >
    );
}

function CanvasDroppable({ items, selectedId, onSelect, scale, showGrid }: any) {
    const { setNodeRef } = useDroppable({
        id: 'canvas-droppable',
    });

    return (
        <div
            ref={setNodeRef}
            id="main-canvas"
            // bg-transparent so parent grid shows through. 
            // Added dashed border to signify "Video Canvas" area without obscuring grid
            className="relative w-[1920px] h-[1080px] bg-transparent shadow-2xl overflow-hidden transition-transform duration-75 ease-linear origin-center border-2 border-dashed border-white/10"
            style={{
                transform: `scale(${scale})`,
            }}
            onClick={() => onSelect(null)}
        >
            {/* Grid Background is now handled by parent container for infinite effect */}

            {items.map((item: any) => (
                <CanvasItem
                    key={item.uniqueId}
                    item={item}
                    selected={item.uniqueId === selectedId}
                    onSelect={() => onSelect(item.uniqueId)}
                    scale={scale}
                />
            ))}
        </div>
    );
}
