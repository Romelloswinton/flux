/**
 * AI Generation Types
 */

export interface AIGenerationJob {
  id: string
  owner_id: string
  job_type: 'text-to-3d' | 'image-to-3d' | 'texture'
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  prompt?: string
  image_url?: string
  options?: Record<string, any>
  external_job_id?: string
  external_status?: string
  result_url?: string
  thumbnail_url?: string
  error_message?: string
  cost_usd?: number
  credits_used?: number
  processing_time_seconds?: number
  created_at: string
  completed_at?: string
  updated_at: string
}

export interface AIGenerationJobInsert {
  owner_id: string
  job_type: 'text-to-3d' | 'image-to-3d' | 'texture'
  prompt?: string
  image_url?: string
  options?: Record<string, any>
}

export interface MeshyTextTo3DRequest {
  prompt: string
  art_style?: 'realistic' | 'cartoon' | 'low-poly' | 'sculpture'
  negative_prompt?: string
  seed?: number
}

export interface MeshyTextTo3DResponse {
  result: string // Task ID
}

export interface MeshyTaskStatus {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED'
  progress: number
  thumbnail_url?: string
  model_urls?: {
    glb?: string
    fbx?: string
    usdz?: string
  }
  texture_urls?: Array<{
    base_color?: string
    metallic?: string
    normal?: string
    roughness?: string
  }>
  video_url?: string
  error?: {
    message: string
    code: string
  }
  created_at: number
  finished_at?: number
}
