/**
 * Profile Page
 */

'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useProjects } from '@/lib/hooks/useProjects'
import { useAssets } from '@/lib/hooks/useAssets'
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/lib/hooks/useProfile'
import { Calendar, Mail, Award, FolderOpen, Layers, Camera, Save, X, Edit2, Twitch, Youtube, Link2 } from 'lucide-react'
import { useState, useRef } from 'react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: projects } = useProjects()
  const { data: assets } = useAssets()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedBio, setEditedBio] = useState('')
  const [editedTwitch, setEditedTwitch] = useState('')
  const [editedYoutube, setEditedYoutube] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U'
    const names = user.user_metadata.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown'

  const handleStartEdit = () => {
    setEditedName(user?.user_metadata?.full_name || '')
    setEditedBio(profile?.bio || '')
    setEditedTwitch(profile?.twitch_username || '')
    setEditedYoutube(profile?.youtube_username || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: editedName || null,
        bio: editedBio || null,
        twitch_username: editedTwitch || null,
        youtube_username: editedYoutube || null,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    try {
      await uploadAvatar.mutateAsync(file)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {getUserInitials()}
                </div>
              )}
              <button
                onClick={handleAvatarClick}
                disabled={uploadAvatar.isPending}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              {uploadAvatar.isPending && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold mb-2">
                    {profile?.full_name || user?.user_metadata?.full_name || 'User'}
                  </h1>
                  <div className="flex items-center gap-4 text-text-secondary mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {joinDate}</span>
                    </div>
                  </div>
                  {profile?.bio && (
                    <p className="text-text-secondary">{profile.bio}</p>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            {!isEditing ? (
              <Button variant="outline" onClick={handleStartEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Linked Accounts */}
        {(isEditing || profile?.twitch_username || profile?.youtube_username) && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Linked Streaming Accounts
            </h2>
            <div className="space-y-4">
              {/* Twitch */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Twitch className="w-6 h-6 text-white" />
                </div>
                {!isEditing ? (
                  <div>
                    <div className="font-medium">Twitch</div>
                    <div className="text-sm text-text-secondary">
                      {profile?.twitch_username ? `@${profile.twitch_username}` : 'Not connected'}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="twitch">Twitch Username</Label>
                    <Input
                      id="twitch"
                      type="text"
                      value={editedTwitch}
                      onChange={(e) => setEditedTwitch(e.target.value)}
                      placeholder="your_twitch_username"
                    />
                  </div>
                )}
              </div>

              {/* YouTube */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                {!isEditing ? (
                  <div>
                    <div className="font-medium">YouTube</div>
                    <div className="text-sm text-text-secondary">
                      {profile?.youtube_username ? `@${profile.youtube_username}` : 'Not connected'}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="youtube">YouTube Username</Label>
                    <Input
                      id="youtube"
                      type="text"
                      value={editedYoutube}
                      onChange={(e) => setEditedYoutube(e.target.value)}
                      placeholder="your_youtube_username"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{projects?.length || 0}</div>
                <div className="text-sm text-text-secondary">Projects</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{assets?.length || 0}</div>
                <div className="text-sm text-text-secondary">Assets</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">FREE</div>
                <div className="text-sm text-text-secondary">Plan</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {projects?.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-text-secondary">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            ))}
            {(!projects || projects.length === 0) && (
              <div className="text-center py-8 text-text-secondary">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
