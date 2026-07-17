-- Milestone 5: Storyline Intelligence Engine
-- Adds character states, character memories, locations, lore memories,
-- plot threads, story arcs, and seasons.

-- ============================================================
-- 1. Extend Episodes table with summary + metadata
-- ============================================================
ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ============================================================
-- 2. Seasons (must be created before story_arcs due to FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyline_id UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- 3. Story Arcs (auto-summarized groups of episodes)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_arcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyline_id UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
    arc_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    start_episode INTEGER NOT NULL,
    end_episode INTEGER NOT NULL,
    season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- 4. Character Current State (latest snapshot per character)
-- ============================================================
CREATE TABLE IF NOT EXISTS character_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
    appearance TEXT,
    clothing TEXT,
    emotional_state TEXT,
    location TEXT,
    inventory TEXT[] DEFAULT '{}',
    is_alive BOOLEAN DEFAULT TRUE,
    last_episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- 5. Character Memory (historical deltas per episode)
-- ============================================================
CREATE TABLE IF NOT EXISTS character_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(character_id, episode_id)
);

-- ============================================================
-- 6. Locations (first-class location memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    appearance TEXT,
    atmosphere TEXT,
    weather TEXT,
    important_objects TEXT[] DEFAULT '{}',
    inhabitants TEXT[] DEFAULT '{}',
    lore TEXT,
    visual_style TEXT,
    first_episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- 7. Lore Memories (dynamic world facts discovered per episode)
-- ============================================================
CREATE TABLE IF NOT EXISTS lore_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    fact TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- 8. Plot Threads (unresolved story hooks)
-- ============================================================
CREATE TABLE IF NOT EXISTS plot_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyline_id UUID NOT NULL REFERENCES storylines(id) ON DELETE CASCADE,
    introduced_episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    resolved_episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- 9. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_char_states_char ON character_states(character_id);
CREATE INDEX IF NOT EXISTS idx_char_memories_char ON character_memories(character_id);
CREATE INDEX IF NOT EXISTS idx_char_memories_episode ON character_memories(episode_id);
CREATE INDEX IF NOT EXISTS idx_locations_project ON locations(project_id);
CREATE INDEX IF NOT EXISTS idx_lore_memories_project ON lore_memories(project_id);
CREATE INDEX IF NOT EXISTS idx_plot_threads_storyline ON plot_threads(storyline_id);
CREATE INDEX IF NOT EXISTS idx_story_arcs_storyline ON story_arcs(storyline_id);
CREATE INDEX IF NOT EXISTS idx_seasons_storyline ON seasons(storyline_id);
