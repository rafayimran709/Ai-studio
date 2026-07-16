-- Milestone 4.1: Add AI generation result fields to generation_history
-- Stores the full AI response, parsed variants, model metadata, and token usage.

ALTER TABLE generation_history
  ADD COLUMN IF NOT EXISTS final_prompt TEXT,
  ADD COLUMN IF NOT EXISTS raw_response TEXT,
  ADD COLUMN IF NOT EXISTS variant_a JSONB,
  ADD COLUMN IF NOT EXISTS variant_b JSONB,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS completion_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS total_tokens INTEGER;

-- Update status column to support the full lifecycle
-- (existing rows default to 'completed', new rows use the status enum)
COMMENT ON COLUMN generation_history.status IS 'Generation status: pending | generating | completed | failed';
