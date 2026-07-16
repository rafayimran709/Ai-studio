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
  status: string;
  created_at: string;
}

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
    };
  };
}
