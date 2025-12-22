# Database Migration Instructions

Run the complete migration file in your Supabase SQL Editor.

## Quick Start

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `00_COMPLETE_MIGRATION.sql`
5. Copy and paste the entire contents
6. Click **Run** (or press `Ctrl+Enter`)
7. Wait for completion (usually 30-60 seconds)

## What This Migration Creates

### ✅ All Tables (15 total)
- **Core Tables:**
  - `profiles` - User profiles with social features
  - `projects` - Overlay designs
  - `project_versions` - Version history
  - `asset_categories` - Asset organization
  - `assets` - Reusable components
  - `user_favorites` - User's favorited assets
  - `project_collaborators` - Sharing & collaboration
  - `project_activity` - Audit log

- **3D & AI Tables:**
  - `models_3d` - 3D model storage
  - `ai_generation_jobs` - AI generation tracking

- **Community Tables:**
  - `user_follows` - User following system
  - `comments` - Comments on projects/assets/models
  - `likes` - Like system
  - `notifications` - User notifications
  - `trending_content` - Trending content tracking

### ✅ Functions & Triggers
- Auto-update timestamps
- Auto-increment version numbers
- Auto-create profile on signup
- Update follower/following counts
- Update like counts
- Update comment reply counts

### ✅ Row Level Security
- RLS enabled on all 15 tables
- 40+ security policies
- Users can only access their own data
- Public content accessible to all

### ✅ Storage Buckets (5 total)
- `project-thumbnails` (public, 5MB limit)
- `asset-media` (public, 10MB limit)
- `exports` (private, 50MB limit)
- `avatars` (public, 2MB limit)
- `models-3d` (public, 100MB limit)

---

## Verification

After running the migration, verify using `VERIFY_MIGRATION.sql`:

1. **Tables Created:**
   ```sql
   SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
   ```
   Should show: **15 tables**

2. **System Categories Exist:**
   ```sql
   SELECT name FROM asset_categories WHERE is_system = true;
   ```
   Should show: Overlays, Badges, Widgets, Templates, Components, Presets

3. **Storage Buckets Created:**
   Go to **Storage** in Supabase dashboard, should see 5 buckets

4. **RLS Enabled:**
   ```sql
   SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
   ```
   Should show: **15** (all tables have RLS enabled)

5. **Run Full Verification:**
   Copy and paste the contents of `VERIFY_MIGRATION.sql` to get a complete report

---

## Troubleshooting

**Error: "extension uuid-ossp does not exist"**
- Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` first

**Error: "permission denied for schema auth"**
- You're running as service_role, this is fine. The `handle_new_user()` function has `SECURITY DEFINER` to handle this.

**Error: "relation storage.buckets does not exist"**
- Storage buckets might need to be created via Dashboard instead of SQL
- Go to **Storage** → **New Bucket** and create manually

**Error: "cannot execute ... in a read-only transaction"**
- Make sure you clicked **Run** button, not just viewing the query

---

## Next Steps

After successful migration:
1. ✅ Test user signup (profile should auto-create)
2. ✅ Test project creation
3. ✅ Test template usage
4. ✅ Verify storage bucket access
5. ✅ Generate TypeScript types (if needed)

## Additional Files

- **`FIX_RLS_RECURSION.sql`** - Only needed if you encounter RLS recursion errors
- **`CREATE_YOUR_PROFILE.sql`** - Manual profile creation (only if auto-creation fails)
- **`VERIFY_MIGRATION.sql`** - Complete verification script
- **`TROUBLESHOOTING.md`** - Detailed troubleshooting guide
- **`START_HERE.md`** - Quick start guide
