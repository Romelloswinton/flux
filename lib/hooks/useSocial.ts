/**
 * useSocial Hook
 *
 * React Query hooks for social features: following, comments, likes, notifications.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// =============================================
// FOLLOWING SYSTEM
// =============================================

/**
 * Follow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (followingId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (user.id === followingId) {
        throw new Error('Cannot follow yourself')
      }

      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: followingId,
        })
        .select()
        .single()

      if (error) throw error

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          recipient_id: followingId,
          type: 'follow',
          actor_id: user.id,
          title: 'New Follower',
          message: 'started following you',
          action_url: `/profile/${user.id}`,
        })

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['is-following'] })
    },
  })
}

/**
 * Unfollow a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (followingId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] })
      queryClient.invalidateQueries({ queryKey: ['followers'] })
      queryClient.invalidateQueries({ queryKey: ['is-following'] })
    },
  })
}

/**
 * Get users that the current user is following
 */
export function useFollowing(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!targetUserId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          created_at,
          profile:profiles!following_id(id, email, full_name, avatar_url, follower_count, following_count)
        `)
        .eq('follower_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

/**
 * Get users following the current user
 */
export function useFollowers(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!targetUserId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          created_at,
          profile:profiles!follower_id(id, email, full_name, avatar_url, follower_count, following_count)
        `)
        .eq('following_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

/**
 * Check if current user is following a specific user
 */
export function useIsFollowing(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['is-following', userId],
    queryFn: async () => {
      if (!userId) return false

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single()

      if (error) return false
      return !!data
    },
    enabled: !!userId,
  })
}

// =============================================
// COMMENTS SYSTEM
// =============================================

export interface Comment {
  id: string
  author_id: string
  entity_type: 'project' | 'asset' | 'model_3d'
  entity_id: string
  content: string
  parent_comment_id: string | null
  like_count: number
  reply_count: number
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // Joined data
  author?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

/**
 * Get comments for an entity
 */
export function useComments(entityType: string, entityId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      if (!entityId) throw new Error('Entity ID required')

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!author_id(id, email, full_name, avatar_url)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_deleted', false)
        .is('parent_comment_id', null) // Only top-level comments
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as Comment[]
    },
    enabled: !!entityId,
  })
}

/**
 * Get replies to a comment
 */
export function useCommentReplies(commentId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['comment-replies', commentId],
    queryFn: async () => {
      if (!commentId) throw new Error('Comment ID required')

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!author_id(id, email, full_name, avatar_url)
        `)
        .eq('parent_comment_id', commentId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as unknown as Comment[]
    },
    enabled: !!commentId,
  })
}

/**
 * Create a comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      content,
      parentCommentId,
    }: {
      entityType: 'project' | 'asset' | 'model_3d'
      entityId: string
      content: string
      parentCommentId?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('comments')
        .insert({
          author_id: user.id,
          entity_type: entityType,
          entity_id: entityId,
          content,
          parent_comment_id: parentCommentId || null,
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for entity owner (if not commenting on own content)
      // This would require fetching the entity owner first
      // Simplified version - create notification for parent comment author
      if (parentCommentId) {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('author_id')
          .eq('id', parentCommentId)
          .single()

        if (parentComment && parentComment.author_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              recipient_id: parentComment.author_id,
              type: 'reply',
              actor_id: user.id,
              entity_type: entityType,
              entity_id: entityId,
              title: 'New Reply',
              message: 'replied to your comment',
              action_url: `/dashboard/${entityType}s/${entityId}`,
            })
        }
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.entityType, variables.entityId] })
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ['comment-replies', variables.parentCommentId] })
      }
    },
  })
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string
      content: string
    }) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] })
    },
  })
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', commentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] })
    },
  })
}

// =============================================
// LIKES SYSTEM
// =============================================

/**
 * Like/unlike content
 */
export function useLikeContent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      isLiked,
    }: {
      entityType: 'project' | 'asset' | 'model_3d' | 'comment'
      entityId: string
      isLiked: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)

        if (error) throw error
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            entity_type: entityType,
            entity_id: entityId,
          })

        if (error) throw error

        // Create notification for content owner
        // Simplified - would need to fetch entity owner
        await supabase
          .from('notifications')
          .insert({
            recipient_id: user.id, // Replace with actual owner
            type: 'like',
            actor_id: user.id,
            entity_type: entityType,
            entity_id: entityId,
            title: 'New Like',
            message: `liked your ${entityType}`,
          })
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['is-liked', variables.entityType, variables.entityId] })
      queryClient.invalidateQueries({ queryKey: ['likes-count', variables.entityType, variables.entityId] })
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}

/**
 * Check if current user liked content
 */
export function useIsLiked(entityType: string, entityId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['is-liked', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return false

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .single()

      return !!data
    },
    enabled: !!entityId,
  })
}

/**
 * Get like count for content
 */
export function useLikesCount(entityType: string, entityId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['likes-count', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return 0

      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)

      if (error) return 0
      return count || 0
    },
    enabled: !!entityId,
  })
}

// =============================================
// NOTIFICATIONS
// =============================================

export interface Notification {
  id: string
  recipient_id: string
  type: string
  actor_id: string | null
  entity_type: string | null
  entity_id: string | null
  title: string
  message: string | null
  action_url: string | null
  is_read: boolean
  created_at: string
  actor?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

/**
 * Get user's notifications
 */
export function useNotifications() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!actor_id(id, full_name, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as unknown as Notification[]
    },
  })
}

/**
 * Get unread notification count
 */
export function useUnreadNotificationCount() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (error) return 0
      return count || 0
    },
  })
}

/**
 * Mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })
}
