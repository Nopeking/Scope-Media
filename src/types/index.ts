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
