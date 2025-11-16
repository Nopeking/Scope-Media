// Database types (matching Supabase schema)
export interface Database {
  public: {
    Tables: {
      streams: {
        Row: {
          id: string;
          title: string;
          url: string;
          status: 'active' | 'inactive' | 'scheduled';
          thumbnail: string | null;
          viewers: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          status?: 'active' | 'inactive' | 'scheduled';
          thumbnail?: string | null;
          viewers?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          status?: 'active' | 'inactive' | 'scheduled';
          thumbnail?: string | null;
          viewers?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      archived_videos: {
        Row: {
          id: string;
          title: string;
          url: string;
          duration: string | null;
          upload_date: string;
          custom_title: string;
          thumbnail: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          duration?: string | null;
          upload_date?: string;
          custom_title: string;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          duration?: string | null;
          upload_date?: string;
          custom_title?: string;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_titles: {
        Row: {
          id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_plan: 'free' | 'premium' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_plan?: 'free' | 'premium' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_plan?: 'free' | 'premium' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_library: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          content_type: 'video' | 'photo' | 'document';
          file_url: string;
          thumbnail_url: string | null;
          file_size: number | null;
          duration: string | null;
          tags: string[] | null;
          is_public: boolean;
          uploaded_by_admin: boolean;
          admin_uploader_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          content_type: 'video' | 'photo' | 'document';
          file_url: string;
          thumbnail_url?: string | null;
          file_size?: number | null;
          duration?: string | null;
          tags?: string[] | null;
          is_public?: boolean;
          uploaded_by_admin?: boolean;
          admin_uploader_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          content_type?: 'video' | 'photo' | 'document';
          file_url?: string;
          thumbnail_url?: string | null;
          file_size?: number | null;
          duration?: string | null;
          tags?: string[] | null;
          is_public?: boolean;
          uploaded_by_admin?: boolean;
          admin_uploader_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_library_sharing: {
        Row: {
          id: string;
          library_item_id: string;
          shared_with_user_id: string;
          permission_level: 'view' | 'download' | 'edit';
          shared_by_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          library_item_id: string;
          shared_with_user_id: string;
          permission_level?: 'view' | 'download' | 'edit';
          shared_by_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          library_item_id?: string;
          shared_with_user_id?: string;
          permission_level?: 'view' | 'download' | 'edit';
          shared_by_user_id?: string;
          created_at?: string;
        };
      };
      riders: {
        Row: {
          id: string;
          external_id: string | null;
          licence: string | null;
          licence_year: number | null;
          first_name: string;
          last_name: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          zipcode: string | null;
          city: string | null;
          address_country: string | null;
          country: string | null;
          club_id: string | null;
          club_name: string | null;
          fei_registration: string | null;
          profile_image_url: string | null;
          is_active: boolean;
          metadata: Record<string, any> | null;
          last_synced_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          licence?: string | null;
          licence_year?: number | null;
          first_name: string;
          last_name: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          zipcode?: string | null;
          city?: string | null;
          address_country?: string | null;
          country?: string | null;
          club_id?: string | null;
          club_name?: string | null;
          fei_registration?: string | null;
          profile_image_url?: string | null;
          is_active?: boolean;
          metadata?: Record<string, any> | null;
          last_synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          licence?: string | null;
          licence_year?: number | null;
          first_name?: string;
          last_name?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          zipcode?: string | null;
          city?: string | null;
          address_country?: string | null;
          country?: string | null;
          club_id?: string | null;
          club_name?: string | null;
          fei_registration?: string | null;
          profile_image_url?: string | null;
          is_active?: boolean;
          metadata?: Record<string, any> | null;
          last_synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_riders: {
        Row: {
          id: string;
          user_id: string;
          rider_id: string;
          verified: boolean;
          linked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rider_id: string;
          verified?: boolean;
          linked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rider_id?: string;
          verified?: boolean;
          linked_at?: string;
        };
      };
      rider_library: {
        Row: {
          id: string;
          rider_id: string;
          title: string;
          description: string | null;
          content_type: 'video' | 'photo' | 'document';
          file_url: string;
          thumbnail_url: string | null;
          file_size: number | null;
          duration: string | null;
          tags: string[] | null;
          is_public: boolean;
          uploaded_by_admin: string | null;
          uploaded_at: string;
          metadata: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          rider_id: string;
          title: string;
          description?: string | null;
          content_type: 'video' | 'photo' | 'document';
          file_url: string;
          thumbnail_url?: string | null;
          file_size?: number | null;
          duration?: string | null;
          tags?: string[] | null;
          is_public?: boolean;
          uploaded_by_admin?: string | null;
          uploaded_at?: string;
          metadata?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          rider_id?: string;
          title?: string;
          description?: string | null;
          content_type?: 'video' | 'photo' | 'document';
          file_url?: string;
          thumbnail_url?: string | null;
          file_size?: number | null;
          duration?: string | null;
          tags?: string[] | null;
          is_public?: boolean;
          uploaded_by_admin?: string | null;
          uploaded_at?: string;
          metadata?: Record<string, any> | null;
        };
      };
      shows: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          show_type: 'national' | 'international';
          location: string | null;
          description: string | null;
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          show_type: 'national' | 'international';
          location?: string | null;
          description?: string | null;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          show_type?: 'national' | 'international';
          location?: string | null;
          description?: string | null;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          show_id: string;
          class_name: string;
          class_rule: 'one_round_against_clock' | 'one_round_not_against_clock' | 'optimum_time' | 'special_two_phases' | 'two_phases' | 'one_round_with_jumpoff' | 'two_rounds_with_tiebreaker' | 'two_rounds_team_with_tiebreaker' | 'accumulator' | 'speed_and_handiness' | 'six_bars';
          class_type: string | null;
          height: string | null;
          price: number | null;
          currency: string | null;
          class_date: string | null;
          start_time: string | null;
          time_allowed: number | null;
          time_allowed_round2: number | null;
          optimum_time: number | null;
          max_points: number;
          number_of_rounds: number;
          linked_stream_id: string | null;
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          show_id: string;
          class_name: string;
          class_rule: 'one_round_against_clock' | 'one_round_not_against_clock' | 'optimum_time' | 'special_two_phases' | 'two_phases' | 'one_round_with_jumpoff' | 'two_rounds_with_tiebreaker' | 'two_rounds_team_with_tiebreaker' | 'accumulator' | 'speed_and_handiness' | 'six_bars';
          class_type?: string | null;
          height?: string | null;
          price?: number | null;
          currency?: string | null;
          class_date?: string | null;
          start_time?: string | null;
          time_allowed?: number | null;
          time_allowed_round2?: number | null;
          optimum_time?: number | null;
          max_points?: number;
          number_of_rounds?: number;
          linked_stream_id?: string | null;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          show_id?: string;
          class_name?: string;
          class_rule?: 'one_round_against_clock' | 'one_round_not_against_clock' | 'optimum_time' | 'special_two_phases' | 'two_phases' | 'one_round_with_jumpoff' | 'two_rounds_with_tiebreaker' | 'two_rounds_team_with_tiebreaker' | 'accumulator' | 'speed_and_handiness' | 'six_bars';
          class_type?: string | null;
          height?: string | null;
          price?: number | null;
          currency?: string | null;
          class_date?: string | null;
          start_time?: string | null;
          time_allowed?: number | null;
          time_allowed_round2?: number | null;
          optimum_time?: number | null;
          max_points?: number;
          number_of_rounds?: number;
          linked_stream_id?: string | null;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      startlist: {
        Row: {
          id: string;
          class_id: string;
          rider_name: string;
          rider_id: string;
          horse_name: string;
          horse_id: string | null;
          team_name: string | null;
          start_order: number;
          bib_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          rider_name: string;
          rider_id: string;
          horse_name: string;
          horse_id?: string | null;
          team_name?: string | null;
          start_order: number;
          bib_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          rider_name?: string;
          rider_id?: string;
          horse_name?: string;
          horse_id?: string | null;
          team_name?: string | null;
          start_order?: number;
          bib_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          startlist_id: string;
          class_id: string;
          round_number: number;
          time_taken: number | null;
          time_faults: number;
          jumping_faults: number;
          total_faults: number;
          points: number;
          status: 'pending' | 'completed' | 'cancelled' | 'retired' | 'eliminated' | 'withdrawn';
          is_jumpoff: boolean;
          qualified_for_jumpoff: boolean;
          rank: number | null;
          final_time: number | null;
          notes: string | null;
          scored_by: string | null;
          scored_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          startlist_id: string;
          class_id: string;
          round_number?: number;
          time_taken?: number | null;
          time_faults?: number;
          jumping_faults?: number;
          total_faults?: number;
          points?: number;
          status?: 'pending' | 'completed' | 'cancelled' | 'retired' | 'eliminated' | 'withdrawn';
          is_jumpoff?: boolean;
          qualified_for_jumpoff?: boolean;
          rank?: number | null;
          final_time?: number | null;
          notes?: string | null;
          scored_by?: string | null;
          scored_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          startlist_id?: string;
          class_id?: string;
          round_number?: number;
          time_taken?: number | null;
          time_faults?: number;
          jumping_faults?: number;
          total_faults?: number;
          points?: number;
          status?: 'pending' | 'completed' | 'cancelled' | 'retired' | 'eliminated' | 'withdrawn';
          is_jumpoff?: boolean;
          qualified_for_jumpoff?: boolean;
          rank?: number | null;
          final_time?: number | null;
          notes?: string | null;
          scored_by?: string | null;
          scored_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_scores: {
        Row: {
          id: string;
          class_id: string;
          team_name: string;
          round_number: number;
          total_faults: number;
          total_time: number;
          rank: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          team_name: string;
          round_number?: number;
          total_faults?: number;
          total_time?: number;
          rank?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          team_name?: string;
          round_number?: number;
          total_faults?: number;
          total_time?: number;
          rank?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Legacy interfaces for backward compatibility
export interface LiveStream {
  id: string;
  title: string;
  url: string;
  status: string;
  thumbnail: string;
  viewers?: number;
}

export interface ArchivedVideo {
  id: string;
  title: string;
  url: string;
  duration: string;
  uploadDate: string;
  customTitle: string;
  thumbnail: string;
}

export interface RecentVideo {
  id: string;
  title: string;
  url: string;
  uploadDate: string;
  thumbnail: string;
}

// Supabase table types
export type Stream = Database['public']['Tables']['streams']['Row'];
export type StreamInsert = Database['public']['Tables']['streams']['Insert'];
export type StreamUpdate = Database['public']['Tables']['streams']['Update'];

export type ArchivedVideoDB = Database['public']['Tables']['archived_videos']['Row'];
export type ArchivedVideoInsert = Database['public']['Tables']['archived_videos']['Insert'];
export type ArchivedVideoUpdate = Database['public']['Tables']['archived_videos']['Update'];

export type CustomTitle = Database['public']['Tables']['custom_titles']['Row'];
export type CustomTitleInsert = Database['public']['Tables']['custom_titles']['Insert'];
export type CustomTitleUpdate = Database['public']['Tables']['custom_titles']['Update'];

// User and Library types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type UserLibraryItem = Database['public']['Tables']['user_library']['Row'];
export type UserLibraryItemInsert = Database['public']['Tables']['user_library']['Insert'];
export type UserLibraryItemUpdate = Database['public']['Tables']['user_library']['Update'];

export type UserLibrarySharing = Database['public']['Tables']['user_library_sharing']['Row'];
export type UserLibrarySharingInsert = Database['public']['Tables']['user_library_sharing']['Insert'];
export type UserLibrarySharingUpdate = Database['public']['Tables']['user_library_sharing']['Update'];

// Rider types
export type Rider = Database['public']['Tables']['riders']['Row'];
export type RiderInsert = Database['public']['Tables']['riders']['Insert'];
export type RiderUpdate = Database['public']['Tables']['riders']['Update'];

export type UserRider = Database['public']['Tables']['user_riders']['Row'];
export type UserRiderInsert = Database['public']['Tables']['user_riders']['Insert'];
export type UserRiderUpdate = Database['public']['Tables']['user_riders']['Update'];

export type RiderLibraryItem = Database['public']['Tables']['rider_library']['Row'];
export type RiderLibraryInsert = Database['public']['Tables']['rider_library']['Insert'];
export type RiderLibraryUpdate = Database['public']['Tables']['rider_library']['Update'];

// Show types
export type Show = Database['public']['Tables']['shows']['Row'];
export type ShowInsert = Database['public']['Tables']['shows']['Insert'];
export type ShowUpdate = Database['public']['Tables']['shows']['Update'];

export type Class = Database['public']['Tables']['classes']['Row'];
export type ClassInsert = Database['public']['Tables']['classes']['Insert'];
export type ClassUpdate = Database['public']['Tables']['classes']['Update'];

export type StartlistEntry = Database['public']['Tables']['startlist']['Row'];
export type StartlistEntryInsert = Database['public']['Tables']['startlist']['Insert'];
export type StartlistEntryUpdate = Database['public']['Tables']['startlist']['Update'];

export type Score = Database['public']['Tables']['scores']['Row'];
export type ScoreInsert = Database['public']['Tables']['scores']['Insert'];
export type ScoreUpdate = Database['public']['Tables']['scores']['Update'];

export type TeamScore = Database['public']['Tables']['team_scores']['Row'];
export type TeamScoreInsert = Database['public']['Tables']['team_scores']['Insert'];
export type TeamScoreUpdate = Database['public']['Tables']['team_scores']['Update'];

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface LibraryItemWithDetails extends UserLibraryItem {
  user_profile?: UserProfile;
  shared_with_count?: number;
}
