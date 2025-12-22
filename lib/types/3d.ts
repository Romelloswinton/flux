/**
 * 3D Model Types
 */

export interface Model3D {
  id: string
  owner_id: string
  name: string
  description?: string

  // File storage
  model_url: string
  thumbnail_url?: string
  file_size_kb?: number

  // Model metadata
  format: 'glb' | 'gltf' | 'fbx'
  poly_count?: number
  has_textures: boolean
  has_animations: boolean
  bounding_box?: {
    width: number
    height: number
    depth: number
  }

  // AI generation data
  generation_method?: 'text-to-3d' | 'image-to-3d' | 'upload' | 'library'
  generation_prompt?: string
  source_image_url?: string

  // Categorization
  category?: string
  tags?: string[]
  is_public: boolean

  // Usage tracking
  download_count: number

  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Model3DInsert {
  owner_id: string
  name: string
  description?: string
  model_url: string
  thumbnail_url?: string
  file_size_kb?: number
  format?: 'glb' | 'gltf' | 'fbx'
  poly_count?: number
  has_textures?: boolean
  has_animations?: boolean
  bounding_box?: {
    width: number
    height: number
    depth: number
  }
  generation_method?: 'text-to-3d' | 'image-to-3d' | 'upload' | 'library'
  generation_prompt?: string
  source_image_url?: string
  category?: string
  tags?: string[]
  is_public?: boolean
}

export interface Model3DUpdate {
  name?: string
  description?: string
  thumbnail_url?: string
  category?: string
  tags?: string[]
  is_public?: boolean
}

export interface Transform3D {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}
