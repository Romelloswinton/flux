/**
 * useCollaboration Hook
 *
 * React Query hooks for project collaboration features.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface ProjectCollaborator {
  project_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  // Joined profile data
  profile?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

/**
 * Fetch collaborators for a project
 */
export function useCollaborators(projectId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['collaborators', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID required')

      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          profile:profiles(id, email, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('invited_at', { ascending: false })

      if (error) throw error
      return data as unknown as ProjectCollaborator[]
    },
    enabled: !!projectId,
  })
}

/**
 * Fetch projects where user is a collaborator
 */
export function useCollaboratingProjects() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['collaborating-projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)

      if (error) throw error
      return data
    },
  })
}

/**
 * Fetch pending collaboration invites for current user
 */
export function usePendingInvites() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          project:projects(id, name, thumbnail_url),
          inviter:profiles!invited_by(id, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .is('accepted_at', null)
        .order('invited_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

/**
 * Invite a collaborator to a project
 */
export function useInviteCollaborator() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      userEmail,
      role = 'editor',
    }: {
      projectId: string
      userEmail: string
      role?: 'editor' | 'viewer'
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Find user by email
      const { data: invitedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (userError || !invitedUser) {
        throw new Error('User not found with that email')
      }

      // Check if already a collaborator
      const { data: existing } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', invitedUser.id)
        .single()

      if (existing) {
        throw new Error('User is already a collaborator on this project')
      }

      // Create invitation
      const { data, error } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: projectId,
          user_id: invitedUser.id,
          role,
          invited_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for invited user
      await supabase
        .from('notifications')
        .insert({
          recipient_id: invitedUser.id,
          type: 'collaboration_invite',
          actor_id: user.id,
          entity_type: 'project',
          entity_id: projectId,
          title: 'Project Collaboration Invite',
          message: `You've been invited to collaborate on a project`,
          action_url: `/dashboard/projects/${projectId}`,
        })

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.projectId] })
    },
  })
}

/**
 * Accept a collaboration invite
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('project_collaborators')
        .update({ accepted_at: new Date().toISOString() })
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Create notification for project owner
      const { data: collaboration } = await supabase
        .from('project_collaborators')
        .select('invited_by')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (collaboration?.invited_by) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: collaboration.invited_by,
            type: 'collaboration_accepted',
            actor_id: user.id,
            entity_type: 'project',
            entity_id: projectId,
            title: 'Collaboration Accepted',
            message: `accepted your collaboration invite`,
            action_url: `/dashboard/projects/${projectId}`,
          })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] })
      queryClient.invalidateQueries({ queryKey: ['collaborating-projects'] })
    },
  })
}

/**
 * Decline a collaboration invite
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] })
    },
  })
}

/**
 * Remove a collaborator from a project
 */
export function useRemoveCollaborator() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: {
      projectId: string
      userId: string
    }) => {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.projectId] })
    },
  })
}

/**
 * Update collaborator role
 */
export function useUpdateCollaboratorRole() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      role,
    }: {
      projectId: string
      userId: string
      role: 'editor' | 'viewer'
    }) => {
      const { data, error } = await supabase
        .from('project_collaborators')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.projectId] })
    },
  })
}

/**
 * Check if user has access to a project
 */
export function useProjectAccess(projectId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['project-access', projectId],
    queryFn: async () => {
      if (!projectId) return null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Check if user is owner
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single()

      if (project?.owner_id === user.id) {
        return { role: 'owner', canEdit: true, canView: true }
      }

      // Check if user is collaborator
      const { data: collaboration } = await supabase
        .from('project_collaborators')
        .select('role, accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (collaboration && collaboration.accepted_at) {
        return {
          role: collaboration.role,
          canEdit: collaboration.role === 'editor',
          canView: true,
        }
      }

      return null
    },
    enabled: !!projectId,
  })
}
