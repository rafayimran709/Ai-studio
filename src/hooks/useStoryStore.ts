import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  physicalDescription: string;
  personalityTraits: string;
}

export interface Storyline {
  id: string;
  projectId: string;
  title: string;
  summary: string;
}

export interface StoryBible {
  projectId: string;
  worldSetting: string;
  visualRules: string;
  narrativeTone: string;
  notes: string;
}

interface StoryState {
  // Navigation / UI States
  activeProjectId: string | null;
  activeStorylineId: string | null;
  isSidebarCollapsed: boolean;

  // Credits & Subscription
  creditsRemaining: number;
  subscriptionPlan: 'free' | 'creator_monthly' | 'studio_yearly';
  subscriptionStatus: 'active' | 'inactive';

  // Active inputs
  promptInput: string;
  selectedDuration: string;
  selectedStyle: string;
  selectedTemplateId: string | null;
  selectedCharacterIds: string[];

  // Streaming & Comparison View Mock State
  isGenerating: boolean;
  streamVariantA: string;
  streamVariantB: string;

  // UI Cache (Mock/Placeholder data for UI display during Milestone 1)
  projects: Project[];
  characters: Record<string, Character[]>; // projectId -> characters
  storylines: Record<string, Storyline[]>; // projectId -> storylines
  storyBibles: Record<string, StoryBible>; // projectId -> bible

  // Actions
  setActiveProject: (id: string | null) => void;
  setActiveStoryline: (id: string | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setPromptInput: (input: string) => void;
  setSelectedDuration: (duration: string) => void;
  setSelectedStyle: (style: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  toggleCharacterSelection: (characterId: string) => void;
  clearCharacterSelection: () => void;
  deductCredit: () => void;

  // Mock AI triggers
  startMockGeneration: () => void;
  stopMockGeneration: () => void;
  addProject: (name: string, description?: string) => void;
  addCharacter: (
    projectId: string,
    character: Omit<Character, 'id' | 'projectId'>
  ) => void;
  updateStoryBible: (projectId: string, bible: Partial<StoryBible>) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  activeProjectId: 'proj-1', // Default mock project for workspace experience
  activeStorylineId: null,
  isSidebarCollapsed: false,
  creditsRemaining: 42,
  subscriptionPlan: 'creator_monthly',
  subscriptionStatus: 'active',
  promptInput: '',
  selectedDuration: '30s',
  selectedStyle: 'Cinematic',
  selectedTemplateId: null,
  selectedCharacterIds: [],
  isGenerating: false,
  streamVariantA: '',
  streamVariantB: '',

  // Seed Mock Data for UI interaction
  projects: [
    {
      id: 'proj-1',
      name: 'Cyberpunk Odyssey',
      description: 'A neon-lit dystopian adventure script project.',
    },
    {
      id: 'proj-2',
      name: 'Haunted Mansion Chronicles',
      description: 'A gothic horror script timeline.',
    },
  ],
  characters: {
    'proj-1': [
      {
        id: 'char-1',
        projectId: 'proj-1',
        name: 'Jax Vance',
        role: 'Protagonist',
        physicalDescription:
          'Mid-30s, cybernetic left eye glowing cyan, worn leather duster coat, rugged build.',
        personalityTraits: 'Stoic, street-smart, speaks in short sentences.',
      },
      {
        id: 'char-2',
        projectId: 'proj-1',
        name: 'Nova Miller',
        role: 'Deuteragonist',
        physicalDescription:
          'Late 20s, short neon pink hair, dark tactical gear, carrying a portable cyberdeck.',
        personalityTraits:
          'Sarcastic, hyper-intellectual, nervous habit of tapping her fingers.',
      },
    ],
    'proj-2': [
      {
        id: 'char-3',
        projectId: 'proj-2',
        name: 'Dr. Alistair Thorne',
        role: 'Protagonist',
        physicalDescription:
          'Late 50s, silver hair, tweed suit, round glasses.',
        personalityTraits:
          'Inquisitive, nervous, speaks with academic precision.',
      },
    ],
  },
  storylines: {
    'proj-1': [
      {
        id: 'line-1',
        projectId: 'proj-1',
        title: 'The Neon Heist',
        summary: 'A squad breaks into Arasaka vault.',
      },
      {
        id: 'line-2',
        projectId: 'proj-1',
        title: 'Grid Run Chase',
        summary: 'Fleeing through the rain-slicked slums on hovercycles.',
      },
    ],
  },
  storyBibles: {
    'proj-1': {
      projectId: 'proj-1',
      worldSetting:
        'Neo-Seoul, 2099. Dominated by megacorporations. Permanent dark rainy nights with volumetric purple/cyan lighting.',
      visualRules:
        'High contrast cinematography, heavy anamorphic lens flare, visual density of technology, cyber-elements.',
      narrativeTone:
        'Neo-noir thriller. High stakes, cynical, philosophical questions about human identity.',
      notes:
        'Ensure visual emphasis on reflection of neon signs in wet street surfaces.',
    },
  },

  setActiveProject: (id) =>
    set({
      activeProjectId: id,
      activeStorylineId: null,
      selectedCharacterIds: [],
    }),
  setActiveStoryline: (id) => set({ activeStorylineId: id }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setPromptInput: (input) => set({ promptInput: input }),
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  toggleCharacterSelection: (characterId) =>
    set((state) => ({
      selectedCharacterIds: state.selectedCharacterIds.includes(characterId)
        ? state.selectedCharacterIds.filter((id) => id !== characterId)
        : [...state.selectedCharacterIds, characterId],
    })),
  clearCharacterSelection: () => set({ selectedCharacterIds: [] }),
  deductCredit: () =>
    set((state) => ({
      creditsRemaining: Math.max(0, state.creditsRemaining - 1),
    })),

  startMockGeneration: () => set({ isGenerating: true }),
  stopMockGeneration: () => set({ isGenerating: false }),
  addProject: (name, description) =>
    set((state) => {
      const newProj = { id: `proj-${Date.now()}`, name, description };
      return {
        projects: [...state.projects, newProj],
        activeProjectId: newProj.id,
      };
    }),
  addCharacter: (projectId, character) =>
    set((state) => {
      const list = state.characters[projectId] || [];
      const newChar = { ...character, id: `char-${Date.now()}`, projectId };
      return {
        characters: {
          ...state.characters,
          [projectId]: [...list, newChar],
        },
      };
    }),
  updateStoryBible: (projectId, bible) =>
    set((state) => {
      const current = state.storyBibles[projectId] || {
        projectId,
        worldSetting: '',
        visualRules: '',
        narrativeTone: '',
        notes: '',
      };
      return {
        storyBibles: {
          ...state.storyBibles,
          [projectId]: { ...current, ...bible },
        },
      };
    }),
}));
