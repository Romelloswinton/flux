/**
 * usePublicContent Hook
 *
 * React Query hooks for discovering public content across the platform.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Project, Asset } from '@/lib/types/database'
import type { Model3D } from '@/lib/types/3d'

/**
 * Fetch all public projects
 */
export function usePublicProjects(options?: {
  category?: string
  tags?: string[]
  search?: string
  limit?: number
  sortBy?: 'recent' | 'popular' | 'trending'
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['public-projects', options],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .is('deleted_at', null)

      // Filter by category
      if (options?.category) {
        query = query.eq('category', options.category)
      }

      // Filter by tags
      if (options?.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags)
      }

      // Search
      if (options?.search) {
        query = query.textSearch('name', options.search, {
          type: 'websearch',
          config: 'english',
        })
      }

      // Sort
      if (options?.sortBy === 'popular') {
        // Sort by a popularity score (you can add a computed column)
        query = query.order('created_at', { ascending: false })
      } else if (options?.sortBy === 'trending') {
        // Sort by recent + engagement
        query = query.order('updated_at', { ascending: false })
      } else {
        // Default: recent
        query = query.order('created_at', { ascending: false })
      }

      // Limit
      if (options?.limit) {
        query = query.limit(options.limit)
      } else {
        query = query.limit(50)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Project[]
    },
  })
}

/**
 * Fetch all public assets
 */
export function usePublicAssets(options?: {
  category?: string
  type?: 'component' | 'template' | 'preset'
  tags?: string[]
  search?: string
  limit?: number
  sortBy?: 'recent' | 'popular' | 'downloads'
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['public-assets', options],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select('*')
        .eq('is_public', true)
        .is('deleted_at', null)

      // Filter by type
      if (options?.type) {
        query = query.eq('type', options.type)
      }

      // Filter by category
      if (options?.category) {
        query = query.eq('category_id', options.category)
      }

      // Filter by tags
      if (options?.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags)
      }

      // Search
      if (options?.search) {
        query = query.textSearch('name', options.search, {
          type: 'websearch',
          config: 'english',
        })
      }

      // Sort
      if (options?.sortBy === 'popular') {
        query = query.order('favorite_count', { ascending: false })
      } else if (options?.sortBy === 'downloads') {
        query = query.order('download_count', { ascending: false })
      } else {
        // Default: recent
        query = query.order('created_at', { ascending: false })
      }

      // Limit
      if (options?.limit) {
        query = query.limit(options.limit)
      } else {
        query = query.limit(50)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Asset[]
    },
  })
}

/**
 * Fetch all public 3D models
 */
export function usePublic3DModels(options?: {
  category?: string
  tags?: string[]
  search?: string
  limit?: number
  sortBy?: 'recent' | 'popular' | 'downloads'
  generationMethod?: 'text-to-3d' | 'image-to-3d' | 'upload'
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['public-3d-models', options],
    queryFn: async () => {
      let query = supabase
        .from('models_3d')
        .select('*')
        .eq('is_public', true)
        .is('deleted_at', null)

      // Filter by category
      if (options?.category) {
        query = query.eq('category', options.category)
      }

      // Filter by generation method
      if (options?.generationMethod) {
        query = query.eq('generation_method', options.generationMethod)
      }

      // Filter by tags
      if (options?.tags && options.tags.length > 0) {
        query = query.contains('tags', options.tags)
      }

      // Search
      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`)
      }

      // Sort
      if (options?.sortBy === 'popular' || options?.sortBy === 'downloads') {
        query = query.order('download_count', { ascending: false })
      } else {
        // Default: recent
        query = query.order('created_at', { ascending: false })
      }

      // Limit
      if (options?.limit) {
        query = query.limit(options.limit)
      } else {
        query = query.limit(50)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Model3D[]
    },
  })
}

/**
 * Fetch featured/trending content
 */
export function useTrendingContent(options?: {
  entityType?: 'project' | 'asset' | 'model_3d'
  limit?: number
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['trending-content', options],
    queryFn: async () => {
      let query = supabase
        .from('trending_content')
        .select('*')
        .order('score', { ascending: false })

      if (options?.entityType) {
        query = query.eq('entity_type', options.entityType)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      } else {
        query = query.limit(20)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
  })
}

/**
 * Get single public project by ID
 */
export function usePublicProject(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['public-project', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID required')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as Project
    },
    enabled: !!id,
  })
}

/**
 * Get single public asset by ID
 */
export function usePublicAsset(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['public-asset', id],
    queryFn: async () => {
      if (!id) throw new Error('Asset ID required')

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as Asset
    },
    enabled: !!id,
  })
}

/**
 * Get single public 3D model by ID
 */
export function usePublic3DModel(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['public-3d-model', id],
    queryFn: async () => {
      if (!id) throw new Error('Model ID required')

      const { data, error } = await supabase
        .from('models_3d')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as Model3D
    },
    enabled: !!id,
  })
}
