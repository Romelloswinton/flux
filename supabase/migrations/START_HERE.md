# 🚀 START HERE - Database Migration Guide

## Quick Start (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/syfvhhjqlwyrdshrtvzb/sql
2. Click **"New Query"**

### Step 2: Run the Complete Migration
1. Open the file: `00_COMPLETE_MIGRATION.sql`
2. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
3. **Paste into the SQL Editor** (Ctrl+V)
4. Click **"Run"** button (or press Ctrl+Enter)
5. ⏳ Wait 10-30 seconds for completion

### Step 3: Verify Success
1. Open the file: `VERIFY_MIGRATION.sql`
2. Copy and paste into a **new query**
3. Click **"Run"**
4. Look for ✅ checkmarks in the results

### Step 4: Create Storage Buckets (if needed)
If the verification shows storage buckets failed:
1. Go to **Storage** tab in Supabase
2. Click **"New Bucket"**
3. Create these 4 buckets:
   - `project-thumbnails` (Public, 5MB)
   - `asset-media` (Public, 10MB)
   - `exports` (Private, 50MB)
   - `avatars` (Public, 2MB)

### Step 5: Test Your App! 🎉
1. Go to your app: http://localhost:3000
2. Sign up with a test account
3. Go to `/dashboard/templates`
4. Click "Use Template" on Cherry Blossoms or Alert Box
5. Should create a project successfully!

---

## What You Get After Migration

### ✅ Database Tables (8 total)
- **profiles** - User accounts and settings
- **projects** - Your overlay designs
- **project_versions** - Undo/redo history
- **asset_categories** - Organization (Overlays, Widgets, etc.)
- **assets** - Reusable components
- **user_favorites** - Saved favorites
- **project_collaborators** - Sharing (future)
- **project_activity** - Audit logs

### ✅ System Categories (6 pre-loaded)
- Overlays (Cherry Blossoms template)
- Badges
- Widgets (Alert Box template)
- Templates
- Components
- Presets

### ✅ Security (RLS)
- Row Level Security enabled on all tables
- ~20+ security policies
- Users can only access their own data
- Public assets/projects accessible to all

### ✅ Auto-Features
- Auto-update timestamps on changes
- Auto-create profile when user signs up
- Auto-version numbering for history
- Auto-cleanup on deletions (cascades)

### ✅ Storage Buckets (4 total)
- **project-thumbnails** - Preview images
- **asset-media** - Asset files & videos
- **exports** - Your exported overlays
- **avatars** - Profile pictures

---

## Files in This Folder

| File | Purpose | When to Use |
|------|---------|-------------|
| `00_COMPLETE_MIGRATION.sql` | **RUN THIS FIRST** | Complete migration - creates everything |
| `VERIFY_MIGRATION.sql` | **RUN THIS SECOND** | Checks if migration succeeded |
| `FIX_RLS_RECURSION.sql` | Fix RLS issues | Only if you encounter RLS errors |
| `CREATE_YOUR_PROFILE.sql` | Create specific profile | Only if profile creation fails |
| `TROUBLESHOOTING.md` | **READ IF ERRORS** | Fixes for common issues |
| `START_HERE.md` | You are here! | Step-by-step guide |
| `README.md` | Detailed instructions | Reference guide |

---

## Expected Results

### ✅ Success Looks Like:
```
✅ PASS: All 8 tables created
✅ PASS: All 6 system categories created
✅ PASS: RLS enabled on all 8 tables
✅ PASS: 20+ RLS policies created
✅ PASS: 5+ triggers created
✅ PASS: 3 functions created
✅ PASS: All 4 storage buckets created
```

### ⚠️ Warning (OK - fixable):
```
⚠️ INFO: No buckets found - you may need to create them manually
```
→ Just create storage buckets manually (Step 4 above)

### ❌ Error (needs troubleshooting):
```
ERROR: permission denied for schema auth
ERROR: relation storage.buckets does not exist
ERROR: syntax error at or near...
```
→ See `TROUBLESHOOTING.md`

---

## What Happens Next?

### Your App Will Now:
1. ✅ **Save all projects** - No more data loss on refresh!
2. ✅ **Auto-save changes** - Every 3 seconds
3. ✅ **Create versions** - Undo/redo history
4. ✅ **Support templates** - Cherry Blossoms & Alert Box work
5. ✅ **Store files** - Thumbnails, exports, videos
6. ✅ **Authenticate users** - Login/signup functional
7. ✅ **Protect data** - RLS prevents unauthorized access

### Try These Features:
- 📁 Create a project → it saves to database
- 🎨 Edit an overlay → auto-saves every 3 seconds
- 📦 Use a template → Cherry Blossoms or Alert Box
- 👤 View profile → `/dashboard/profile`
- 📂 Manage files → `/dashboard/files`
- 🎯 Browse templates → `/dashboard/templates`

---

## Common Questions

**Q: Do I need to run this every time I start the app?**
A: No! Run ONCE. The database persists forever.

**Q: What if I mess up?**
A: See "Rollback" section in `TROUBLESHOOTING.md` to start fresh.

**Q: Can I edit the data manually?**
A: Yes! Use the **Table Editor** in Supabase Dashboard.

**Q: How do I add more templates?**
A: Edit `lib/constants/widgets.ts` and add to `PREBUILT_OVERLAYS` or `PREBUILT_WIDGETS`.

**Q: Storage buckets failed - is that OK?**
A: Yes! Just create them manually in the Dashboard (Step 4).

**Q: The verification script shows warnings?**
A: Check `TROUBLESHOOTING.md` for specific fixes.

---

## Timeline

- ⏱️ **Migration:** ~30 seconds
- ⏱️ **Verification:** ~10 seconds
- ⏱️ **Manual bucket creation (if needed):** ~2 minutes
- ⏱️ **Total time:** ~5 minutes

---

## Success Checklist

Before you start coding, verify:

- [ ] Ran `00_COMPLETE_MIGRATION.sql` successfully
- [ ] Ran `VERIFY_MIGRATION.sql` - all ✅ checkmarks
- [ ] Storage buckets exist (4 total)
- [ ] Can sign up a test user
- [ ] Profile auto-created for new user
- [ ] Can create a test project
- [ ] Templates work (`/dashboard/templates`)
- [ ] No console errors in browser
- [ ] App loads without database errors

---

## Need Help?

1. **Check verification results** - Run `VERIFY_MIGRATION.sql`
2. **Read troubleshooting guide** - `TROUBLESHOOTING.md`
3. **Check Supabase logs** - Dashboard → Logs → Database
4. **Share error details** - Copy full error message

---

## 🎉 Ready to Migrate?

1. Open Supabase SQL Editor
2. Run `00_COMPLETE_MIGRATION.sql`
3. Run `VERIFY_MIGRATION.sql`
4. Create storage buckets (if needed)
5. Start building! 🚀

**Good luck! You've got this! 💪**
