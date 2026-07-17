export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbStoryline {
  id: string;
  project_id: string;
  title: string;
  synopsis: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbEpisode {
  id: string;
  storyline_id: string;
  episode_number: number;
  title: string;
  prompt: string | null;
  duration: string;
  style: string;
  template: string | null;
  status: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DbCharacter {
  id: string;
  project_id: string;
  name: string;
  appearance: string;
  personality: string | null;
  age: number | null;
  notes: string | null;
  created_at: string;
}

export interface DbStoryBible {
  id: string;
  project_id: string;
  world_setting: string | null;
  visual_style: string | null;
  narrative_tone: string | null;
  writing_rules: string | null;
  lore: string | null;
  updated_at: string;
}

export interface DbPromptTemplate {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  created_at: string;
}

export interface DbGenerationHistory {
  id: string;
  project_id: string;
  storyline_id: string | null;
  episode_id: string | null;
  prompt: string;
  final_prompt: string | null;
  raw_response: string | null;
  variant_a: Record<string, unknown> | null;
  variant_b: Record<string, unknown> | null;
  model: string | null;
  provider: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  status: string;
  created_at: string;
}

// ==========================================
// Milestone 5: Storyline Intelligence Engine
// ==========================================

export interface DbCharacterState {
  id: string;
  character_id: string;
  appearance: string | null;
  clothing: string | null;
  emotional_state: string | null;
  location: string | null;
  inventory: string[];
  is_alive: boolean;
  last_episode_id: string | null;
  updated_at: string;
}

export interface DbCharacterMemory {
  id: string;
  character_id: string;
  episode_id: string;
  changes: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

export interface DbLocation {
  id: string;
  project_id: string;
  name: string;
  appearance: string | null;
  atmosphere: string | null;
  weather: string | null;
  important_objects: string[];
  inhabitants: string[];
  lore: string | null;
  visual_style: string | null;
  first_episode_id: string | null;
  updated_at: string;
}

export interface DbLoreMemory {
  id: string;
  project_id: string;
  episode_id: string | null;
  topic: string;
  fact: string;
  is_active: boolean;
  created_at: string;
}

export interface DbPlotThread {
  id: string;
  storyline_id: string;
  introduced_episode_id: string | null;
  resolved_episode_id: string | null;
  description: string;
  status: string;
  created_at: string;
}

export interface DbStoryArc {
  id: string;
  storyline_id: string;
  arc_number: number;
  title: string;
  summary: string;
  start_episode: number;
  end_episode: number;
  season_id: string | null;
  created_at: string;
}

export interface DbSeason {
  id: string;
  storyline_id: string;
  season_number: number;
  title: string;
  summary: string;
  created_at: string;
}

// ==========================================
// Database interface
// ==========================================

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: DbProject;
        Insert: Omit<DbProject, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbProject, 'id'>>;
      };
      storylines: {
        Row: DbStoryline;
        Insert: Omit<DbStoryline, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbStoryline, 'id'>>;
      };
      episodes: {
        Row: DbEpisode;
        Insert: Omit<DbEpisode, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbEpisode, 'id'>>;
      };
      characters: {
        Row: DbCharacter;
        Insert: Omit<DbCharacter, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbCharacter, 'id'>>;
      };
      story_bibles: {
        Row: DbStoryBible;
        Insert: Omit<DbStoryBible, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbStoryBible, 'id'>>;
      };
      prompt_templates: {
        Row: DbPromptTemplate;
        Insert: Omit<DbPromptTemplate, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbPromptTemplate, 'id'>>;
      };
      generation_history: {
        Row: DbGenerationHistory;
        Insert: Omit<DbGenerationHistory, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbGenerationHistory, 'id'>>;
      };
      character_states: {
        Row: DbCharacterState;
        Insert: Omit<DbCharacterState, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbCharacterState, 'id'>>;
      };
      character_memories: {
        Row: DbCharacterMemory;
        Insert: Omit<DbCharacterMemory, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbCharacterMemory, 'id'>>;
      };
      locations: {
        Row: DbLocation;
        Insert: Omit<DbLocation, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbLocation, 'id'>>;
      };
      lore_memories: {
        Row: DbLoreMemory;
        Insert: Omit<DbLoreMemory, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbLoreMemory, 'id'>>;
      };
      plot_threads: {
        Row: DbPlotThread;
        Insert: Omit<DbPlotThread, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbPlotThread, 'id'>>;
      };
      story_arcs: {
        Row: DbStoryArc;
        Insert: Omit<DbStoryArc, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbStoryArc, 'id'>>;
      };
      seasons: {
        Row: DbSeason;
        Insert: Omit<DbSeason, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbSeason, 'id'>>;
      };
    };
  };
}
