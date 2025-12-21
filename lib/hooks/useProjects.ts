/**
 * useProjects Hook
 *
 * React Query hooks for project CRUD operations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Project, ProjectInsert, ProjectUpdate } from '@/lib/types/database'

/**
 * Fetch all projects for the current user
 */
export function useProjects() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data as Project[]
    },
  })
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error

      // Update last_opened_at
      await (supabase as any)
        .from('projects')
        .update({ last_opened_at: new Date().toISOString() })
        .eq('id', id)

      return data as Project
    },
    enabled: !!id,
  })
}

/**
 * Create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      console.log('🚀 Creating project with data:', project)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('👤 Current user:', user?.id, user?.email)

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!user) {
        console.error('❌ No user found')
        throw new Error('Not authenticated')
      }

      const insertData = {
        ...project,
        owner_id: user.id,
      }
      console.log('📝 Inserting data:', insertData)

      const { data, error } = await (supabase as any)
        .from('projects')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('❌ Database error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(`Database error: ${error.message}${error.hint ? ` (${error.hint})` : ''}`)
      }

      console.log('✅ Project created successfully:', data)
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

/**
 * Update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProjectUpdate }) => {
      const { data, error } = await (supabase as any)
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] })
    },
  })
}

/**
 * Duplicate a project
 */
export function useDuplicateProject() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch the original project
      const { data: original, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (fetchError) throw fetchError
      if (!original) throw new Error('Project not found')

      const originalProject = original as Project

      // Create a duplicate
      const { data, error } = await (supabase as any)
        .from('projects')
        .insert({
          owner_id: user.id,
          name: `${originalProject.name} (Copy)`,
          description: originalProject.description,
          canvas_width: originalProject.canvas_width,
          canvas_height: originalProject.canvas_height,
          canvas_background_color: originalProject.canvas_background_color,
          project_data: originalProject.project_data,
          category: originalProject.category,
          tags: originalProject.tags,
        })
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

/**
 * Soft delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await (supabase as any)
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
