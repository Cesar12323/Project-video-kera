import { create } from 'zustand';

export type Language = 'en' | 'it';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        'settings.title': 'Settings',
        'settings.theme': 'Theme',
        'settings.dark': 'Dark',
        'settings.light': 'Light',
        'settings.language': 'Language',
        // Sidebar
        'sidebar.editor': 'Editor',
        'sidebar.templates': 'Templates',
        'sidebar.queue': 'Render Queue',
        'sidebar.scene': 'Scene Builder',
        'sidebar.settings': 'Settings',
        // Scene Builder Categories
        'scene.backgrounds': 'Backgrounds',
        'scene.shapes': 'Shapes',
        'scene.text': 'Text',
        'scene.effects': 'Effects',
        'scene.layers': 'Layers',
        'scene.dragHere': 'Drag components here',
        'scene.dragToScene': 'Drag to scene',
        // Scene Items
        'item.gradient': 'Gradient',
        'item.dark': 'Dark',
        'item.cube': 'Cube',
        'item.sphere': 'Sphere',
        'item.pyramid': 'Pyramid',
        'item.star': 'Star',
        'item.title': 'Title',
        'item.body': 'Body Text',
        'item.particles': 'Particles',
        'item.glow': 'Glow',
    },
    it: {
        'settings.title': 'Impostazioni',
        'settings.theme': 'Tema',
        'settings.dark': 'Scuro',
        'settings.light': 'Chiaro',
        'settings.language': 'Lingua',
        // Sidebar
        'sidebar.editor': 'Editor',
        'sidebar.templates': 'Modelli',
        'sidebar.queue': 'Coda di Rendering',
        'sidebar.scene': 'Costruttore Scena',
        'sidebar.settings': 'Impostazioni',
        // Scene Builder Categories
        'scene.backgrounds': 'Sfondi',
        'scene.shapes': 'Forme',
        'scene.text': 'Testo',
        'scene.effects': 'Effetti',
        'scene.layers': 'Livelli',
        'scene.dragHere': 'Trascina componenti qui',
        'scene.dragToScene': 'Trascina sulla scena',
        // Scene Items
        'item.gradient': 'Gradiente',
        'item.dark': 'Scuro',
        'item.cube': 'Cubo',
        'item.sphere': 'Sfera',
        'item.pyramid': 'Piramide',
        'item.star': 'Stella',
        'item.title': 'Titolo',
        'item.body': 'Testo',
        'item.particles': 'Particelle',
        'item.glow': 'Bagliore',
    },
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
    language: 'en',
    setLanguage: (lang) => set({ language: lang }),
    t: (key) => {
        const lang = get().language;
        return translations[lang][key] || key;
    },
}));

// Export a hook compatible with the usage in settings page
export const useLanguage = useLanguageStore;
