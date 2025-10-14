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
