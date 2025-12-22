/**
 * use3DModels Hook
 *
 * React Query hooks for 3D model CRUD operations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Model3D, Model3DInsert, Model3DUpdate } from '@/lib/types/3d'

/**
 * Fetch all 3D models for the current user
 */
export function use3DModels() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['models-3d'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('models_3d')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Model3D[]
    },
  })
}

/**
 * Fetch a single 3D model by ID
 */
export function use3DModel(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['models-3d', id],
    queryFn: async () => {
      if (!id) throw new Error('Model ID is required')

      const { data, error } = await supabase
        .from('models_3d')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as Model3D
    },
    enabled: !!id,
  })
}

/**
 * Create a new 3D model
 */
export function useCreate3DModel() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (model: Model3DInsert) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('models_3d')
        .insert({ ...model, owner_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data as Model3D
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models-3d'] })
    },
  })
}

/**
 * Update an existing 3D model
 */
export function useUpdate3DModel() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Model3DUpdate }) => {
      const { data, error } = await supabase
        .from('models_3d')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Model3D
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['models-3d'] })
      queryClient.invalidateQueries({ queryKey: ['models-3d', data.id] })
    },
  })
}

/**
 * Soft delete a 3D model
 */
export function useDelete3DModel() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('models_3d')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models-3d'] })
    },
  })
}

/**
 * Upload 3D model file to Supabase Storage
 */
export async function upload3DModelFile(file: File, userId: string): Promise<string> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('models-3d')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('models-3d')
    .getPublicUrl(data.path)

  return publicUrl
}
