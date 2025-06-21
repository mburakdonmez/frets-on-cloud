export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      Album: {
        Row: {
          artist: number;
          cover: string;
          created_at: string;
          duration: number;
          explicit_lyrics: boolean;
          id: number;
          label: string;
          record_type: string;
          release_date: string;
          title: string;
          upc: string;
        };
        Insert: {
          artist: number;
          cover: string;
          created_at?: string;
          duration: number;
          explicit_lyrics: boolean;
          id?: number;
          label: string;
          record_type: string;
          release_date: string;
          title: string;
          upc: string;
        };
        Update: {
          artist?: number;
          cover?: string;
          created_at?: string;
          duration?: number;
          explicit_lyrics?: boolean;
          id?: number;
          label?: string;
          record_type?: string;
          release_date?: string;
          title?: string;
          upc?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Album_artist_fkey";
            columns: ["artist"];
            isOneToOne: false;
            referencedRelation: "Artist";
            referencedColumns: ["id"];
          },
        ];
      };
      Artist: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          nb_album: number | null;
          picture: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          nb_album?: number | null;
          picture?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          nb_album?: number | null;
          picture?: string;
        };
        Relationships: [];
      };
      Songs: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          track: number;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          track: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          track?: number;
        };
        Relationships: [
          {
            foreignKeyName: "Songs_track_fkey";
            columns: ["track"];
            isOneToOne: false;
            referencedRelation: "Track";
            referencedColumns: ["id"];
          },
        ];
      };
      Track: {
        Row: {
          album: number;
          artist: number;
          bpm: number;
          created_at: string;
          disk_number: number;
          duration: number;
          explicit_lyrics: boolean;
          gain: number;
          id: number;
          isrc: string;
          preview: string;
          release_date: string;
          title: string;
          title_short: string;
          title_version: string;
          track_token: string;
        };
        Insert: {
          album: number;
          artist: number;
          bpm: number;
          created_at?: string;
          disk_number: number;
          duration: number;
          explicit_lyrics: boolean;
          gain: number;
          id?: number;
          isrc: string;
          preview: string;
          release_date: string;
          title: string;
          title_short: string;
          title_version: string;
          track_token: string;
        };
        Update: {
          album?: number;
          artist?: number;
          bpm?: number;
          created_at?: string;
          disk_number?: number;
          duration?: number;
          explicit_lyrics?: boolean;
          gain?: number;
          id?: number;
          isrc?: string;
          preview?: string;
          release_date?: string;
          title?: string;
          title_short?: string;
          title_version?: string;
          track_token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Track_album_fkey";
            columns: ["album"];
            isOneToOne: false;
            referencedRelation: "Album";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Track_artist_fkey";
            columns: ["artist"];
            isOneToOne: false;
            referencedRelation: "Artist";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
