export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          is_admin: boolean | null
        }
        Insert: {
          id: string
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
      cvs: {
        Row: {
          address: string | null
          applicant_name: string
          availability_for_remote_work: boolean | null
          avatar_url: string | null
          career_goals: string | null
          certifications: string | null
          created_at: string | null
          current_job_title: string | null
          desired_salary: string | null
          education: string | null
          email: string | null
          github_profile: string | null
          id: string
          industry_experience: string | null
          languages_known: string[] | null
          linkedin_profile: string | null
          phone: string | null
          portfolio_link: string | null
          rating: number | null
          references: string | null
          requirements_match: number | null
          skills: string[]
          status: string | null
          updated_at: string | null
          user_id: string | null
          willingness_to_relocate: boolean | null
          years_experience: number
        }
        Insert: {
          address?: string | null
          applicant_name: string
          availability_for_remote_work?: boolean | null
          avatar_url?: string | null
          career_goals?: string | null
          certifications?: string | null
          created_at?: string | null
          current_job_title?: string | null
          desired_salary?: string | null
          education?: string | null
          email?: string | null
          github_profile?: string | null
          id?: string
          industry_experience?: string | null
          languages_known?: string[] | null
          linkedin_profile?: string | null
          phone?: string | null
          portfolio_link?: string | null
          rating?: number | null
          references?: string | null
          requirements_match?: number | null
          skills: string[]
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          willingness_to_relocate?: boolean | null
          years_experience: number
        }
        Update: {
          address?: string | null
          applicant_name?: string
          availability_for_remote_work?: boolean | null
          avatar_url?: string | null
          career_goals?: string | null
          certifications?: string | null
          created_at?: string | null
          current_job_title?: string | null
          desired_salary?: string | null
          education?: string | null
          email?: string | null
          github_profile?: string | null
          id?: string
          industry_experience?: string | null
          languages_known?: string[] | null
          linkedin_profile?: string | null
          phone?: string | null
          portfolio_link?: string | null
          rating?: number | null
          references?: string | null
          requirements_match?: number | null
          skills?: string[]
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          willingness_to_relocate?: boolean | null
          years_experience?: number
        }
        Relationships: []
      }
      interviews: {
        Row: {
          created_at: string | null
          cv_id: string | null
          feedback: string | null
          id: string
          recruiter_id: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cv_id?: string | null
          feedback?: string | null
          id?: string
          recruiter_id?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cv_id?: string | null
          feedback?: string | null
          id?: string
          recruiter_id?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          user_id?: string | null
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
