'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useFollowing,
  useFollowers,
  useNotifications,
  useUnreadNotificationCount,
} from '@/lib/hooks/useSocial'
import {
  usePendingInvites,
  useCollaboratingProjects,
} from '@/lib/hooks/useCollaboration'
import {
  usePublicProjects,
  usePublicAssets,
  usePublic3DModels,
} from '@/lib/hooks/usePublicContent'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Users,
  UserPlus,
  Bell,
  TrendingUp,
  Sparkles,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  ArrowRight,
  Loader2,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  Compass,
  Box,
  Layers,
} from 'lucide-react'
import { FollowButton } from '@/components/community/FollowButton'
import { NotificationCenter } from '@/components/community/NotificationCenter'
import { useAcceptInvite, useDeclineInvite } from '@/lib/hooks/useCollaboration'

export default function CommunityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: following = [] } = useFollowing()
  const { data: followers = [] } = useFollowers()
  const { data: pendingInvites = [] } = usePendingInvites()
  const { data: collaboratingProjects = [] } = useCollaboratingProjects()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  const { data: recentProjects = [], isLoading: loadingProjects } = usePublicProjects({
    sortBy: 'recent',
    limit: 6,
  })
  const { data: trendingAssets = [], isLoading: loadingAssets } = usePublicAssets({
    sortBy: 'popular',
    limit: 6,
  })

  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()

  const handleAcceptInvite = async (projectId: string) => {
    try {
      await acceptInvite.mutateAsync({ projectId })
    } catch (error) {
      console.error('Failed to accept invite:', error)
    }
  }

  const handleDeclineInvite = async (projectId: string) => {
    try {
      await declineInvite.mutateAsync({ projectId })
    } catch (error) {
      console.error('Failed to decline invite:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Community</h1>
              </div>
              <p className="text-xl text-purple-50 max-w-2xl">
                Connect, collaborate, and share with creators around the world
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/dashboard/discover')}
                className="gap-2"
              >
                <Compass className="w-5 h-5" />
                Discover
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowNotifications(!showNotifications)}
                className="gap-2 relative"
              >
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{followers.length}</p>
                  <p className="text-sm text-purple-100">Followers</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-3">
                <UserPlus className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{following.length}</p>
                  <p className="text-sm text-purple-100">Following</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-3">
                <Layers className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{collaboratingProjects.length}</p>
                  <p className="text-sm text-purple-100">Collaborations</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{pendingInvites.length}</p>
                  <p className="text-sm text-purple-100">Pending Invites</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold">Pending Invites</h2>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {pendingInvites.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {pendingInvites.map((invite: any) => (
                    <div
                      key={invite.project_id}
                      className="p-4 rounded-lg border border-border bg-gray-50 dark:bg-gray-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {invite.inviter?.avatar_url ? (
                          <img
                            src={invite.inviter.avatar_url}
                            alt={invite.inviter.full_name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            {invite.inviter?.full_name?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            <span className="text-purple-600">{invite.inviter?.full_name || 'Someone'}</span>
                            {' '}invited you to collaborate
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Project: {invite.project?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite.project_id)}
                          disabled={acceptInvite.isPending}
                          className="gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite.project_id)}
                          disabled={declineInvite.isPending}
                          className="gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Community Projects */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Recent from Community</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/discover')}
                  className="gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {loadingProjects ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No public projects yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {recentProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="group text-left"
                    >
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-12 h-12 text-purple-300" />
                        )}
                      </div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Trending Assets */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold">Trending Assets</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/discover')}
                  className="gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {loadingAssets ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : trendingAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Box className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No public assets yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {trendingAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => router.push(`/dashboard/store`)}
                      className="group"
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                        {asset.thumbnail_url ? (
                          <img
                            src={asset.thumbnail_url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Box className="w-8 h-8 text-purple-300" />
                        )}
                      </div>
                      <p className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {asset.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Heart className="w-3 h-3" />
                        <span>{asset.favorite_count || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Notifications Panel */}
            {showNotifications && (
              <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}

            {/* Following */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="font-semibold">Following</h3>
                  <span className="text-sm text-gray-500">({following.length})</span>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {following.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Not following anyone yet</p>
                  </div>
                ) : (
                  following.map((follow: any) => (
                    <div
                      key={follow.following_id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <div className="flex items-center gap-2">
                        {follow.profile?.avatar_url ? (
                          <img
                            src={follow.profile.avatar_url}
                            alt={follow.profile.full_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {follow.profile?.full_name?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            {follow.profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {follow.profile?.follower_count || 0} followers
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/discover')}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Discover Content
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/3d-builder')}
                >
                  <Box className="w-4 h-4 mr-2" />
                  3D Builder
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/ai-generator')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generator
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/projects')}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  My Projects
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
