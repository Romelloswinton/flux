-- =============================================
-- Arc3D - COMPLETE DATABASE MIGRATION
-- =============================================
-- This file contains ALL database migrations in one place
-- Run this ONCE in your Supabase SQL Editor
--
-- After running, verify using VERIFY_MIGRATION.sql
-- =============================================

-- =============================================
-- EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PART 1: CREATE ALL TABLES
-- =============================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO')),
  twitch_username TEXT,
  youtube_username TEXT,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Overlay',
  description TEXT,
  thumbnail_url TEXT,

  -- Canvas settings
  canvas_width INTEGER NOT NULL DEFAULT 1920,
  canvas_height INTEGER NOT NULL DEFAULT 1080,
  canvas_background_color TEXT DEFAULT '#1a1a2e',

  -- Project state (serialized JSON)
  project_data JSONB NOT NULL DEFAULT '{"shapes": [], "layers": []}'::jsonb,

  -- Metadata
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT,
  tags TEXT[],
  collaborative BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_opened_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- 3. PROJECT_VERSIONS TABLE
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  project_data JSONB NOT NULL,
  change_description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(project_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON project_versions(created_at DESC);

-- 4. ASSET_CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_categories_is_system ON asset_categories(is_system);
CREATE INDEX IF NOT EXISTS idx_asset_categories_owner_id ON asset_categories(owner_id);

-- Seed system categories
INSERT INTO asset_categories (name, icon, description, is_system, display_order)
VALUES
  ('Overlays', 'layers', 'Full overlay templates', TRUE, 1),
  ('Badges', 'award', 'Custom badges and icons', TRUE, 2),
  ('Widgets', 'cpu', 'Interactive stream widgets', TRUE, 3),
  ('Templates', 'grid', 'Reusable design templates', TRUE, 4),
  ('Components', 'package', 'UI components', TRUE, 5),
  ('Presets', 'sparkles', 'Style presets', TRUE, 6)
ON CONFLICT (name) DO NOTHING;

-- 5. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('component', 'template', 'preset')),
  category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  asset_data JSONB NOT NULL,
  thumbnail_url TEXT,
  preview_urls TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[],
  download_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_is_public ON assets(is_public);
CREATE INDEX IF NOT EXISTS idx_assets_deleted_at ON assets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- 6. USER_FAVORITES TABLE
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_asset_id ON user_favorites(asset_id);

-- 7. PROJECT_COLLABORATORS TABLE
CREATE TABLE IF NOT EXISTS project_collaborators (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- 8. PROJECT_ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'shared', 'exported')),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON project_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON project_activity(created_at DESC);

-- 9. 3D MODELS TABLE
CREATE TABLE IF NOT EXISTS models_3d (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- File storage
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size_kb INTEGER,

  -- Model metadata
  format VARCHAR(10) DEFAULT 'glb',
  poly_count INTEGER,
  has_textures BOOLEAN DEFAULT false,
  has_animations BOOLEAN DEFAULT false,
  bounding_box JSONB,

  -- AI generation data
  generation_method VARCHAR(50),
  generation_prompt TEXT,
  source_image_url TEXT,

  -- Categorization
  category VARCHAR(50),
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,

  -- Usage tracking
  download_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_models_3d_owner_id ON models_3d(owner_id);
CREATE INDEX IF NOT EXISTS idx_models_3d_created_at ON models_3d(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);
CREATE INDEX IF NOT EXISTS idx_models_3d_is_public ON models_3d(is_public);

-- 10. AI GENERATION JOBS TABLE
CREATE TABLE IF NOT EXISTS ai_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Job details
  job_type VARCHAR(50) NOT NULL DEFAULT 'text-to-3d',
  status VARCHAR(50) DEFAULT 'pending',

  -- Input parameters
  prompt TEXT,
  image_url TEXT,
  options JSONB,

  -- External API tracking
  external_job_id VARCHAR(255),
  external_status VARCHAR(50),

  -- Output
  result_url TEXT,
  thumbnail_url TEXT,
  error_message TEXT,

  -- Billing
  cost_usd DECIMAL(10, 4),
  credits_used INTEGER,

  -- Performance
  processing_time_seconds INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_owner_id ON ai_generation_jobs(owner_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON ai_generation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_external_job_id ON ai_generation_jobs(external_job_id);

-- 11. USER FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id, created_at DESC);

-- 12. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Polymorphic relationship
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'asset', 'model_3d')),
  entity_id UUID NOT NULL,

  -- Comment content
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),

  -- Reply threading
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Engagement
  like_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,

  -- Moderation
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- 13. LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Polymorphic relationship
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'asset', 'model_3d', 'comment')),
  entity_id UUID NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_entity ON likes(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id, created_at DESC);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification type
  type TEXT NOT NULL CHECK (type IN (
    'follow',
    'like',
    'comment',
    'reply',
    'collaboration_invite',
    'collaboration_accepted',
    'project_shared',
    'asset_downloaded'
  )),

  -- Related entities
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,

  -- Notification content
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,

  -- Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- 15. TRENDING CONTENT TABLE
CREATE TABLE IF NOT EXISTS trending_content (
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'asset', 'model_3d')),
  entity_id UUID NOT NULL,
  score DECIMAL NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_trending_score ON trending_content(score DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_type ON trending_content(entity_type, score DESC);

-- =============================================
-- PART 2: CREATE FUNCTIONS & TRIGGERS
-- =============================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-set version number
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM project_versions
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update 3D models timestamp
CREATE OR REPLACE FUNCTION update_models_3d_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update AI jobs timestamp
CREATE OR REPLACE FUNCTION update_ai_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update comment reply count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    UPDATE comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
    UPDATE comments
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.parent_comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.entity_type = 'comment' THEN
      UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.entity_id;
    ELSIF NEW.entity_type = 'asset' THEN
      UPDATE assets SET favorite_count = favorite_count + 1 WHERE id = NEW.entity_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.entity_type = 'comment' THEN
      UPDATE comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
    ELSIF OLD.entity_type = 'asset' THEN
      UPDATE assets SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = OLD.entity_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Update comments updated_at and is_edited
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.content != OLD.content THEN
    NEW.is_edited = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS models_3d_updated_at ON models_3d;
CREATE TRIGGER models_3d_updated_at
  BEFORE UPDATE ON models_3d
  FOR EACH ROW
  EXECUTE FUNCTION update_models_3d_updated_at();

DROP TRIGGER IF EXISTS ai_jobs_updated_at ON ai_generation_jobs;
CREATE TRIGGER ai_jobs_updated_at
  BEFORE UPDATE ON ai_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_jobs_updated_at();

-- Trigger: Auto-set version number
DROP TRIGGER IF EXISTS set_project_version_number ON project_versions;
CREATE TRIGGER set_project_version_number
  BEFORE INSERT ON project_versions
  FOR EACH ROW
  EXECUTE FUNCTION set_version_number();

-- Trigger: Handle new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: Update comment reply count
DROP TRIGGER IF EXISTS trigger_update_comment_reply_count ON comments;
CREATE TRIGGER trigger_update_comment_reply_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reply_count();

-- Trigger: Update follow counts
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON user_follows;
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Trigger: Update like counts
DROP TRIGGER IF EXISTS trigger_update_like_counts ON likes;
CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Trigger: Update comments timestamp
DROP TRIGGER IF EXISTS trigger_update_comments_timestamp ON comments;
CREATE TRIGGER trigger_update_comments_timestamp
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- =============================================
-- PART 3: ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_content ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 4: RLS POLICIES
-- =============================================

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles can be created" ON profiles;
CREATE POLICY "Profiles can be created"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id
    OR is_public = TRUE
  );

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- PROJECT_VERSIONS POLICIES
DROP POLICY IF EXISTS "Users can view project versions" ON project_versions;
CREATE POLICY "Users can view project versions"
  ON project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create project versions" ON project_versions;
CREATE POLICY "Users can create project versions"
  ON project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ASSET_CATEGORIES POLICIES
DROP POLICY IF EXISTS "Anyone can view asset categories" ON asset_categories;
CREATE POLICY "Anyone can view asset categories"
  ON asset_categories FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can create custom categories" ON asset_categories;
CREATE POLICY "Users can create custom categories"
  ON asset_categories FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND is_system = FALSE);

DROP POLICY IF EXISTS "Users can update own categories" ON asset_categories;
CREATE POLICY "Users can update own categories"
  ON asset_categories FOR UPDATE
  USING (auth.uid() = owner_id AND is_system = FALSE);

DROP POLICY IF EXISTS "Users can delete own categories" ON asset_categories;
CREATE POLICY "Users can delete own categories"
  ON asset_categories FOR DELETE
  USING (auth.uid() = owner_id AND is_system = FALSE);

-- ASSETS POLICIES
DROP POLICY IF EXISTS "Users can view public and own assets" ON assets;
CREATE POLICY "Users can view public and own assets"
  ON assets FOR SELECT
  USING (
    is_public = TRUE
    OR auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "Users can create assets" ON assets;
CREATE POLICY "Users can create assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own assets" ON assets;
CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own assets" ON assets;
CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid() = owner_id);

-- USER_FAVORITES POLICIES
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON user_favorites;
CREATE POLICY "Users can add favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorites" ON user_favorites;
CREATE POLICY "Users can remove favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- PROJECT_COLLABORATORS POLICIES
DROP POLICY IF EXISTS "Users can view project collaborators" ON project_collaborators;
CREATE POLICY "Users can view project collaborators"
  ON project_collaborators FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project owners can add collaborators" ON project_collaborators;
CREATE POLICY "Project owners can add collaborators"
  ON project_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project owners can remove collaborators" ON project_collaborators;
CREATE POLICY "Project owners can remove collaborators"
  ON project_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id AND projects.owner_id = auth.uid()
    )
  );

-- PROJECT_ACTIVITY POLICIES
DROP POLICY IF EXISTS "Users can view project activity" ON project_activity;
CREATE POLICY "Users can view project activity"
  ON project_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs" ON project_activity;
CREATE POLICY "Users can create activity logs"
  ON project_activity FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 3D MODELS POLICIES
DROP POLICY IF EXISTS "Users can view their own 3D models" ON models_3d;
CREATE POLICY "Users can view their own 3D models"
  ON models_3d FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Anyone can view public 3D models" ON models_3d;
CREATE POLICY "Anyone can view public 3D models"
  ON models_3d FOR SELECT
  TO public
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert their own 3D models" ON models_3d;
CREATE POLICY "Users can insert their own 3D models"
  ON models_3d FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own 3D models" ON models_3d;
CREATE POLICY "Users can update their own 3D models"
  ON models_3d FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own 3D models" ON models_3d;
CREATE POLICY "Users can delete their own 3D models"
  ON models_3d FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- AI GENERATION JOBS POLICIES
DROP POLICY IF EXISTS "Users can view their own AI jobs" ON ai_generation_jobs;
CREATE POLICY "Users can view their own AI jobs"
  ON ai_generation_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can create AI jobs" ON ai_generation_jobs;
CREATE POLICY "Users can create AI jobs"
  ON ai_generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own AI jobs" ON ai_generation_jobs;
CREATE POLICY "Users can update their own AI jobs"
  ON ai_generation_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- USER FOLLOWS POLICIES
DROP POLICY IF EXISTS "Anyone can view follows" ON user_follows;
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON user_follows;
CREATE POLICY "Users can manage their own follows"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON user_follows;
CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- COMMENTS POLICIES
DROP POLICY IF EXISTS "Anyone can view non-deleted comments" ON comments;
CREATE POLICY "Anyone can view non-deleted comments"
  ON comments FOR SELECT
  TO public
  USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own comments" ON comments;
CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own comments" ON comments;
CREATE POLICY "Authors can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- LIKES POLICIES
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own likes" ON likes;
CREATE POLICY "Users can manage their own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- TRENDING CONTENT POLICIES
DROP POLICY IF EXISTS "Anyone can view trending content" ON trending_content;
CREATE POLICY "Anyone can view trending content"
  ON trending_content FOR SELECT
  TO public
  USING (true);

-- =============================================
-- PART 5: STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-thumbnails', 'project-thumbnails', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('asset-media', 'asset-media', TRUE, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'video/mp4']::text[]),
  ('exports', 'exports', FALSE, 52428800, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/zip']::text[]),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('models-3d', 'models-3d', TRUE, 104857600, ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Users can upload own thumbnails" ON storage.objects;
CREATE POLICY "Users can upload own thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-thumbnails');

DROP POLICY IF EXISTS "Users can upload own asset media" ON storage.objects;
CREATE POLICY "Users can upload own asset media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'asset-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view asset media" ON storage.objects;
CREATE POLICY "Anyone can view asset media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-media');

DROP POLICY IF EXISTS "Users can upload own exports" ON storage.objects;
CREATE POLICY "Users can upload own exports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;
CREATE POLICY "Users can view own exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own 3D models" ON storage.objects;
CREATE POLICY "Users can upload own 3D models"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'models-3d'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view 3D models" ON storage.objects;
CREATE POLICY "Anyone can view 3D models"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'models-3d');

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================
-- Run VERIFY_MIGRATION.sql to confirm everything worked
-- =============================================
