import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ComponentType = 'shape' | 'character' | 'effect' | 'other';

export interface Template {
    id: string;
    name: string;
    type: ComponentType;
    icon: string; // lucide icon name or image url
    content: string; // code or identifier
}

interface TemplateState {
    templates: Template[];
    addTemplate: (template: Template) => void;
    removeTemplate: (id: string) => void;
    getTemplatesByType: (type: ComponentType) => Template[];
}

export const useTemplateStore = create<TemplateState>()(
    persist(
        (set, get) => ({
            templates: [
                // Default Shapes
                { id: 'shape-rect', name: 'Square', type: 'shape', icon: 'Square', content: 'Rectangle code...' },
                { id: 'shape-circle', name: 'Circle', type: 'shape', icon: 'Circle', content: 'Circle code...' },
                { id: 'shape-triangle', name: 'Triangle', type: 'shape', icon: 'Triangle', content: 'Triangle code...' },
            ],
            addTemplate: (template) => set((state) => ({
                templates: [...state.templates, template]
            })),
            removeTemplate: (id) => set((state) => ({
                templates: state.templates.filter((t) => t.id !== id)
            })),
            getTemplatesByType: (type) => get().templates.filter((t) => t.type === type),
        }),
        {
            name: 'project-video-templates',
        }
    )
);
