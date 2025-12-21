/**
 * useAssets Hook
 *
 * React Query hooks for asset CRUD operations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Asset, AssetInsert, AssetUpdate, AssetCategory } from '@/lib/types/database'

/**
 * Fetch all assets for the current user
 */
export function useAssets(categoryId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['assets', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Asset[]
    },
  })
}

/**
 * Fetch all asset categories
 */
export function useAssetCategories() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      return data as AssetCategory[]
    },
  })
}

/**
 * Create a new asset
 */
export function useCreateAsset() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (asset: AssetInsert) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await (supabase as any)
        .from('assets')
        .insert({
          ...asset,
          owner_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Asset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

/**
 * Update an existing asset
 */
export function useUpdateAsset() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AssetUpdate }) => {
      const { data, error } = await (supabase as any)
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Asset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

/**
 * Soft delete an asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await (supabase as any)
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

/**
 * Toggle asset favorite
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ assetId, isFavorite }: { assetId: string; isFavorite: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isFavorite) {
        // Remove favorite
        const { error } = await (supabase as any)
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('asset_id', assetId)

        if (error) throw error
      } else {
        // Add favorite
        const { error } = await (supabase as any)
          .from('user_favorites')
          .insert({
            user_id: user.id,
            asset_id: assetId,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
