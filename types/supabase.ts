/**
 * Supabase schema types for community tables.
 * Replace with `supabase gen types` output when available.
 */

import type { CommunitySpaceId } from '@/lib/community/constants'
import type { PostStage } from '@/lib/community/post-schema'

/** posts.status — matches the DDL check constraint (active/archived/removed). */
export type PostStatus = 'active' | 'archived' | 'removed'

/** comments.status — DB default is 'published'. 'low_quality' suppresses from curated feeds. */
export type CommentStatus = 'published' | 'hidden' | 'removed' | 'low_quality'

export type ProfileBadge = 'member' | 'builder' | 'verified_founder' | null

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          body: string
          space: CommunitySpaceId
          stage: PostStage
          status: PostStatus
          upvotes: number
          comment_count: number
          is_bot_processed: boolean | null
          created_at: string
          author_id: string
          product_url: string | null
        }
        Insert: {
          id?: string
          slug?: string
          title: string
          body: string
          space: CommunitySpaceId
          stage: PostStage
          status?: PostStatus
          upvotes?: number
          comment_count?: number
          is_bot_processed?: boolean | null
          created_at?: string
          author_id: string
          product_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          badge: ProfileBadge
          bio: string | null
          karma_points: number | null
          total_reviews: number | null
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          badge?: ProfileBadge
          bio?: string | null
          karma_points?: number | null
          total_reviews?: number | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string | null
          parent_id: string | null
          body: string
          upvotes: number
          is_bot: boolean
          status: CommentStatus
          karma_awarded: boolean | null
          moderation_score: number | null
          moderation_flags: string[] | null
          moderation_version: number | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id?: string | null
          parent_id?: string | null
          body: string
          upvotes?: number
          is_bot?: boolean
          status?: CommentStatus
          karma_awarded?: boolean | null
          moderation_score?: number | null
          moderation_flags?: string[] | null
          moderation_version?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      karma_events: {
        Row: {
          id: string
          user_id: string
          event_type: 'review_given'
          points: number
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: 'review_given'
          points: number
          reference_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['karma_events']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'karma_events_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: 'post' | 'comment'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: 'post' | 'comment'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['upvotes']['Insert']>
        Relationships: []
      }
      bot_scans: {
        Row: {
          id: string
          post_id: string
          keyword_cpc: number | null
          competitor_count: number | null
          competitors: unknown
          risk_flags: unknown
          full_report_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          keyword_cpc?: number | null
          competitor_count?: number | null
          competitors?: unknown
          risk_flags?: unknown
          full_report_url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['bot_scans']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'bot_scans_post_id_fkey'
            columns: ['post_id']
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_karma: {
        Args: {
          p_user_id: string
          p_delta: number
        }
        Returns: number
      }
      award_comment_karma: {
        Args: {
          p_comment_id: string
          p_profile_id: string
          p_user_id: string
          p_points: number
          p_event_type: string
        }
        Returns: boolean
      }
      get_user_velocity: {
        Args: {
          p_profile_id: string
          p_window_mins: number
        }
        Returns: number
      }
    }
    Enums: Record<string, never>
  }
}

export type PostRow = Database['public']['Tables']['posts']['Row']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type CommentRow = Database['public']['Tables']['comments']['Row']
export type UpvoteRow = Database['public']['Tables']['upvotes']['Row']
export type BotScanRow = Database['public']['Tables']['bot_scans']['Row']
export type KarmaEventRow = Database['public']['Tables']['karma_events']['Row']
export type UpvoteTargetType = UpvoteRow['target_type']
