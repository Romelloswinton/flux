export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_generation_jobs: {
        Row: {
          completed_at: string | null
          cost_usd: number | null
          created_at: string | null
          credits_used: number | null
          error_message: string | null
          external_job_id: string | null
          external_status: string | null
          id: string
          image_url: string | null
          job_type: string
          options: Json | null
          owner_id: string
          processing_time_seconds: number | null
          prompt: string | null
          result_url: string | null
          status: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          external_job_id?: string | null
          external_status?: string | null
          id?: string
          image_url?: string | null
          job_type?: string
          options?: Json | null
          owner_id: string
          processing_time_seconds?: number | null
          prompt?: string | null
          result_url?: string | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          external_job_id?: string | null
          external_status?: string | null
          id?: string
          image_url?: string | null
          job_type?: string
          options?: Json | null
          owner_id?: string
          processing_time_seconds?: number | null
          prompt?: string | null
          result_url?: string | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      asset_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_system: boolean
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_categories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_data: Json
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          download_count: number
          favorite_count: number
          id: string
          is_public: boolean
          name: string
          owner_id: string
          preview_urls: string[] | null
          tags: string[] | null
          thumbnail_url: string | null
          type: string
          updated_at: string
        }
        Insert: {
          asset_data: Json
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          download_count?: number
          favorite_count?: number
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          preview_urls?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          asset_data?: Json
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          download_count?: number
          favorite_count?: number
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          preview_urls?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          deleted_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_deleted: boolean
          is_edited: boolean
          like_count: number
          parent_comment_id: string | null
          reply_count: number
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          like_count?: number
          parent_comment_id?: string | null
          reply_count?: number
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          like_count?: number
          parent_comment_id?: string | null
          reply_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      models_3d: {
        Row: {
          bounding_box: Json | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          download_count: number | null
          file_size_kb: number | null
          format: string | null
          generation_method: string | null
          generation_prompt: string | null
          has_animations: boolean | null
          has_textures: boolean | null
          id: string
          is_public: boolean | null
          model_url: string
          name: string
          owner_id: string
          poly_count: number | null
          source_image_url: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          bounding_box?: Json | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size_kb?: number | null
          format?: string | null
          generation_method?: string | null
          generation_prompt?: string | null
          has_animations?: boolean | null
          has_textures?: boolean | null
          id?: string
          is_public?: boolean | null
          model_url: string
          name: string
          owner_id: string
          poly_count?: number | null
          source_image_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bounding_box?: Json | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size_kb?: number | null
          format?: string | null
          generation_method?: string | null
          generation_prompt?: string | null
          has_animations?: boolean | null
          has_textures?: boolean | null
          id?: string
          is_public?: boolean | null
          model_url?: string
          name?: string
          owner_id?: string
          poly_count?: number | null
          source_image_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          message: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          follower_count: number
          following_count: number
          full_name: string | null
          id: string
          tier: string
          twitch_username: string | null
          updated_at: string
          username: string | null
          youtube_username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id: string
          tier?: string
          twitch_username?: string | null
          updated_at?: string
          username?: string | null
          youtube_username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id?: string
          tier?: string
          twitch_username?: string | null
          updated_at?: string
          username?: string | null
          youtube_username?: string | null
        }
        Relationships: []
      }
      project_activity: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          accepted_at: string | null
          invited_at: string
          invited_by: string | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          invited_at?: string
          invited_by?: string | null
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          invited_at?: string
          invited_by?: string | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string | null
          id: string
          project_data: Json
          project_id: string
          version_number: number
        }
        Insert: {
          change_description?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_data: Json
          project_id: string
          version_number: number
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_data?: Json
          project_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          canvas_background_color: string | null
          canvas_height: number
          canvas_width: number
          category: string | null
          collaborative: boolean
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_public: boolean
          is_template: boolean
          last_opened_at: string | null
          name: string
          owner_id: string
          project_data: Json
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          canvas_background_color?: string | null
          canvas_height?: number
          canvas_width?: number
          category?: string | null
          collaborative?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          is_template?: boolean
          last_opened_at?: string | null
          name?: string
          owner_id: string
          project_data?: Json
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          canvas_background_color?: string | null
          canvas_height?: number
          canvas_width?: number
          category?: string | null
          collaborative?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          is_template?: boolean
          last_opened_at?: string | null
          name?: string
          owner_id?: string
          project_data?: Json
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_content: {
        Row: {
          comment_count: number
          created_at: string
          download_count: number
          entity_id: string
          entity_type: string
          like_count: number
          score: number
          updated_at: string
          view_count: number
        }
        Insert: {
          comment_count?: number
          created_at: string
          download_count?: number
          entity_id: string
          entity_type: string
          like_count?: number
          score?: number
          updated_at?: string
          view_count?: number
        }
        Update: {
          comment_count?: number
          created_at?: string
          download_count?: number
          entity_id?: string
          entity_type?: string
          like_count?: number
          score?: number
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          asset_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
