-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Storylines table
CREATE TABLE IF NOT EXISTS storylines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    synopsis TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Episodes table
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyline_id UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT,
    duration TEXT NOT NULL,
    style TEXT NOT NULL,
    template TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    appearance TEXT NOT NULL,
    personality TEXT,
    age INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Story Bible table
CREATE TABLE IF NOT EXISTS story_bibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    world_setting TEXT,
    visual_style TEXT,
    narrative_tone TEXT,
    writing_rules TEXT,
    lore TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Prompt Templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    system_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Generation History table
CREATE TABLE IF NOT EXISTS generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    storyline_id UUID REFERENCES storylines(id) ON DELETE SET NULL,
    episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_storylines_project_id ON storylines(project_id);
CREATE INDEX IF NOT EXISTS idx_episodes_storyline_id ON episodes(storyline_id);
CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_project_id ON generation_history(project_id);

-- Insert Default Prompt Templates
INSERT INTO prompt_templates (name, description, system_prompt) VALUES
('Hollywood Film', 'Classic cinematic structure with standard establishing shots, medium focus, and detailed voiceover cues.', 'Hollywood film style structure...'),
('Pixar', 'Vibrant, high-key animated visual prompt outlines with expressive emotional sound effects.', 'Pixar animated style structure...'),
('Anime', 'High-contrast action framing, dynamic angles, fast pans, and stylized audio descriptions.', 'Anime style structure...'),
('Commercial', 'Punchy, fast-paced transitions with explicit key lighting and prominent product/narrator audio.', 'Commercial promo style structure...'),
('Movie Trailer', 'Epic, high-contrast visual breakdowns, deep boom sound effects, and high-impact voiceovers.', 'Movie trailer promo style structure...'),
('YouTube Shorts', 'Portrait-oriented layout rules, fast-paced changes (every 2-3s), and loop-friendly hooks.', 'YouTube shorts layout structure...'),
('Documentary', 'Natural lighting guidelines, slow static interviews, ambient room sounds, and informative narration.', 'Documentary layout structure...'),
('Music Video', 'Stylized, rhythmic scene cuts matching beats, heavy color grading rules, and non-linear visuals.', 'Music video layout structure...')
ON CONFLICT (name) DO NOTHING;
