/**
 * Database Type Definitions
 *
 * These types match the Supabase database schema.
 *
 * To regenerate these types automatically:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Generate: supabase gen types typescript --project-id syfvhhjqlwyrdshrtvzb > lib/supabase/database.types.ts
 *
 * For now, we'll use manual type definitions.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          twitch_username: string | null
          youtube_username: string | null
          tier: 'FREE' | 'PRO'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          twitch_username?: string | null
          youtube_username?: string | null
          tier?: 'FREE' | 'PRO'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          twitch_username?: string | null
          youtube_username?: string | null
          tier?: 'FREE' | 'PRO'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          thumbnail_url: string | null
          canvas_width: number
          canvas_height: number
          canvas_background_color: string
          project_data: Json
          is_template: boolean
          is_public: boolean
          category: string | null
          tags: string[] | null
          collaborative: boolean
          created_at: string
          updated_at: string
          last_opened_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          canvas_width?: number
          canvas_height?: number
          canvas_background_color?: string
          project_data?: Json
          is_template?: boolean
          is_public?: boolean
          category?: string | null
          tags?: string[] | null
          collaborative?: boolean
          created_at?: string
          updated_at?: string
          last_opened_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          thumbnail_url?: string | null
          canvas_width?: number
          canvas_height?: number
          canvas_background_color?: string
          project_data?: Json
          is_template?: boolean
          is_public?: boolean
          category?: string | null
          tags?: string[] | null
          collaborative?: boolean
          created_at?: string
          updated_at?: string
          last_opened_at?: string | null
          deleted_at?: string | null
        }
      }
      project_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          project_data: Json
          change_description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number?: number
          project_data: Json
          change_description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          project_data?: Json
          change_description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      asset_categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          description: string | null
          is_system: boolean
          owner_id: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          description?: string | null
          is_system?: boolean
          owner_id?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          description?: string | null
          is_system?: boolean
          owner_id?: string | null
          display_order?: number
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          type: 'component' | 'template' | 'preset'
          category_id: string | null
          asset_data: Json
          thumbnail_url: string | null
          preview_urls: string[] | null
          is_public: boolean
          tags: string[] | null
          download_count: number
          favorite_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          type: 'component' | 'template' | 'preset'
          category_id?: string | null
          asset_data: Json
          thumbnail_url?: string | null
          preview_urls?: string[] | null
          is_public?: boolean
          tags?: string[] | null
          download_count?: number
          favorite_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          type?: 'component' | 'template' | 'preset'
          category_id?: string | null
          asset_data?: Json
          thumbnail_url?: string | null
          preview_urls?: string[] | null
          is_public?: boolean
          tags?: string[] | null
          download_count?: number
          favorite_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      user_favorites: {
        Row: {
          user_id: string
          asset_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          asset_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          asset_id?: string
          created_at?: string
        }
      }
      project_collaborators: {
        Row: {
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by: string | null
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          project_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          project_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
        }
      }
      project_activity: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          action: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          action: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          action?: string
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
