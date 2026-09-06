// ============================================================================
// AUTOMATICALLY GENERATED SUPABASE DATABASE SCHEMA TYPES
// Single Source of Truth for PostgreSQL Tables & PostgREST API
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string;
          company_id: string | null;
          name: string | null;
          key: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          name?: string | null;
          key?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string | null;
          key?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      audio_notes: {
        Row: {
          id: string;
          company_id: string | null;
          project_id: string | null;
          transcript: string | null;
          audio_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          transcript?: string | null;
          audio_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          transcript?: string | null;
          audio_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          action: string;
          details: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          action: string;
          details?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          action?: string;
          details?: any | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      cad_plans: {
        Row: {
          id: string;
          company_id: string | null;
          project_id: string | null;
          name: string | null;
          elements: any | null;
          layers: any | null;
          active_layer_id: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          name?: string | null;
          elements?: any | null;
          layers?: any | null;
          active_layer_id?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          name?: string | null;
          elements?: any | null;
          layers?: any | null;
          active_layer_id?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          company_id: string | null;
          project_id: string | null;
          title: string | null;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          location: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          title?: string | null;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          location?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          title?: string | null;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          location?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          call_id: string | null;
          sender_id: string | null;
          sender_name: string | null;
          message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          call_id?: string | null;
          sender_id?: string | null;
          sender_name?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          call_id?: string | null;
          sender_id?: string | null;
          sender_name?: string | null;
          message?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          plan: string | null;
          max_seats: number | null;
          used_seats: number | null;
          owner_id: string | null;
          created_at: string | null;
          screensaver_active: boolean | null;
          screensaver_image: string | null;
          screensaver_timeout: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: string | null;
          max_seats?: number | null;
          used_seats?: number | null;
          owner_id?: string | null;
          created_at?: string | null;
          screensaver_active?: boolean | null;
          screensaver_image?: string | null;
          screensaver_timeout?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: string | null;
          max_seats?: number | null;
          used_seats?: number | null;
          owner_id?: string | null;
          created_at?: string | null;
          screensaver_active?: boolean | null;
          screensaver_image?: string | null;
          screensaver_timeout?: number | null;
        };
        Relationships: [];
      };
      company_settings: {
        Row: {
          company_id: string;
          screensaver_active: boolean | null;
          screensaver_image: string | null;
          screensaver_timeout: number | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          screensaver_active?: boolean | null;
          screensaver_image?: string | null;
          screensaver_timeout?: number | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          screensaver_active?: boolean | null;
          screensaver_image?: string | null;
          screensaver_timeout?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          first_name: string | null;
          last_name: string | null;
          name: string | null;
          email: string | null;
          phone: string | null;
          role: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          first_name?: string | null;
          last_name?: string | null;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      defects: {
        Row: {
          id: string;
          project_id: string | null;
          model_id: string | null;
          company_id: string | null;
          owner_id: string | null;
          position: any | null;
          normal: any | null;
          prompt: string | null;
          description: string | null;
          status: string | null;
          severity: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          model_id?: string | null;
          company_id?: string | null;
          owner_id?: string | null;
          position?: any | null;
          normal?: any | null;
          prompt?: string | null;
          description?: string | null;
          status?: string | null;
          severity?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          model_id?: string | null;
          company_id?: string | null;
          owner_id?: string | null;
          position?: any | null;
          normal?: any | null;
          prompt?: string | null;
          description?: string | null;
          status?: string | null;
          severity?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          name: string;
          url: string | null;
          file_url: string | null;
          project_id: string | null;
          folder_id: string | null;
          category: string | null;
          owner_id: string | null;
          uploaded_by: string | null;
          company_id: string | null;
          type: string | null;
          size: string | null;
          is_folder: boolean | null;
          created_at: string | null;
          uploaded_at: string | null;
          date: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          url?: string | null;
          file_url?: string | null;
          project_id?: string | null;
          folder_id?: string | null;
          category?: string | null;
          owner_id?: string | null;
          uploaded_by?: string | null;
          company_id?: string | null;
          type?: string | null;
          size?: string | null;
          is_folder?: boolean | null;
          created_at?: string | null;
          uploaded_at?: string | null;
          date?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string | null;
          file_url?: string | null;
          project_id?: string | null;
          folder_id?: string | null;
          category?: string | null;
          owner_id?: string | null;
          uploaded_by?: string | null;
          company_id?: string | null;
          type?: string | null;
          size?: string | null;
          is_folder?: boolean | null;
          created_at?: string | null;
          uploaded_at?: string | null;
          date?: string | null;
        };
        Relationships: [];
      };
      embeddings: {
        Row: {
          id: string;
          company_id: string;
          doc_id: string | null;
          vector: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          doc_id?: string | null;
          vector?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          doc_id?: string | null;
          vector?: any | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          target_value: number | null;
          current_value: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          target_value?: number | null;
          current_value?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          target_value?: number | null;
          current_value?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          token: string;
          company_id: string | null;
          email: string;
          role: string | null;
          status: string | null;
          used_by: string | null;
          created_at: string | null;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          company_id?: string | null;
          email: string;
          role?: string | null;
          status?: string | null;
          used_by?: string | null;
          created_at?: string | null;
          used_at?: string | null;
        };
        Update: {
          id?: string;
          token?: string;
          company_id?: string | null;
          email?: string;
          role?: string | null;
          status?: string | null;
          used_by?: string | null;
          created_at?: string | null;
          used_at?: string | null;
        };
        Relationships: [];
      };
      knowledge_docs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          content: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          content?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          content?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          company: string | null;
          company_id: string | null;
          status: string | null;
          notes: string | null;
          value: number | null;
          source: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          company_id?: string | null;
          status?: string | null;
          notes?: string | null;
          value?: number | null;
          source?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          company_id?: string | null;
          status?: string | null;
          notes?: string | null;
          value?: number | null;
          source?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          company_id: string | null;
          user_id: string | null;
          title: string;
          message: string;
          type: string | null;
          read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          user_id?: string | null;
          title: string;
          message: string;
          type?: string | null;
          read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          user_id?: string | null;
          title?: string;
          message?: string;
          type?: string | null;
          read?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: string | null;
          company_id: string | null;
          has_active_subscription: boolean | null;
          stripe_customer_id: string | null;
          plan: string | null;
          trial_ends_at: string | null;
          can_view_finance: boolean | null;
          can_approve_budget: boolean | null;
          has_seen_tour: boolean | null;
          has_completed_onboarding: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: string | null;
          company_id?: string | null;
          has_active_subscription?: boolean | null;
          stripe_customer_id?: string | null;
          plan?: string | null;
          trial_ends_at?: string | null;
          can_view_finance?: boolean | null;
          can_approve_budget?: boolean | null;
          has_seen_tour?: boolean | null;
          has_completed_onboarding?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: string | null;
          company_id?: string | null;
          has_active_subscription?: boolean | null;
          stripe_customer_id?: string | null;
          plan?: string | null;
          trial_ends_at?: string | null;
          can_view_finance?: boolean | null;
          can_approve_budget?: boolean | null;
          has_seen_tour?: boolean | null;
          has_completed_onboarding?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string | null;
          user_id: string | null;
          company_id: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          company_id?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          company_id?: string | null;
        };
        Relationships: [];
      };
      project_schedules: {
        Row: {
          id: string;
          company_id: string | null;
          schedules: any | null;
          active_schedule_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          schedules?: any | null;
          active_schedule_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          schedules?: any | null;
          active_schedule_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      project_tasks: {
        Row: {
          id: string;
          company_id: string;
          project_id: string | null;
          title: string;
          status: string | null;
          assigned_to: string | null;
          due_date: string | null;
          visibility: string | null;
          owner_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          project_id?: string | null;
          title: string;
          status?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          visibility?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          project_id?: string | null;
          title?: string;
          status?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          visibility?: string | null;
          owner_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          company_id: string | null;
          owner_id: string | null;
          name: string;
          description: string | null;
          status: string | null;
          budget: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          owner_id?: string | null;
          name: string;
          description?: string | null;
          status?: string | null;
          budget?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          owner_id?: string | null;
          name?: string;
          description?: string | null;
          status?: string | null;
          budget?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      site_data: {
        Row: {
          id: string;
          company_id: string;
          project_id: string | null;
          data: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          project_id?: string | null;
          data?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          project_id?: string | null;
          data?: any | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      slides: {
        Row: {
          id: string;
          project_id: string | null;
          company_id: string | null;
          title: string | null;
          subtitle: string | null;
          content: string | null;
          layout: string | null;
          image_url: string | null;
          order_index: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          company_id?: string | null;
          title?: string | null;
          subtitle?: string | null;
          content?: string | null;
          layout?: string | null;
          image_url?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          company_id?: string | null;
          title?: string | null;
          subtitle?: string | null;
          content?: string | null;
          layout?: string | null;
          image_url?: string | null;
          order_index?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      smart_proposals: {
        Row: {
          id: string;
          company_id: string | null;
          project_id: string | null;
          owner_id: string | null;
          share_token: string;
          title: string;
          client_name: string;
          client_company: string | null;
          client_email: string | null;
          client_phone: string | null;
          intro_text: string | null;
          hero_video_url: string | null;
          hero_image_url: string | null;
          base_price: number | null;
          currency: string | null;
          options: any | null;
          attachments: any | null;
          legal_documents: any | null;
          payment_milestones: any | null;
          theme_style: string | null;
          theme_color: string | null;
          slides: any | null;
          status: string | null;
          expires_at: string | null;
          pin_code: string | null;
          views_count: number | null;
          last_viewed_at: string | null;
          accepted_at: string | null;
          accepted_by: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          owner_id?: string | null;
          share_token: string;
          title?: string;
          client_name?: string;
          client_company?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          intro_text?: string | null;
          hero_video_url?: string | null;
          hero_image_url?: string | null;
          base_price?: number | null;
          currency?: string | null;
          options?: any | null;
          attachments?: any | null;
          legal_documents?: any | null;
          payment_milestones?: any | null;
          theme_style?: string | null;
          theme_color?: string | null;
          slides?: any | null;
          status?: string | null;
          expires_at?: string | null;
          pin_code?: string | null;
          views_count?: number | null;
          last_viewed_at?: string | null;
          accepted_at?: string | null;
          accepted_by?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          owner_id?: string | null;
          share_token?: string;
          title?: string;
          client_name?: string;
          client_company?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          intro_text?: string | null;
          hero_video_url?: string | null;
          hero_image_url?: string | null;
          base_price?: number | null;
          currency?: string | null;
          options?: any | null;
          attachments?: any | null;
          legal_documents?: any | null;
          payment_milestones?: any | null;
          theme_style?: string | null;
          theme_color?: string | null;
          slides?: any | null;
          status?: string | null;
          expires_at?: string | null;
          pin_code?: string | null;
          views_count?: number | null;
          last_viewed_at?: string | null;
          accepted_at?: string | null;
          accepted_by?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          company_id: string | null;
          user_email: string | null;
          email: string | null;
          subject: string | null;
          message: string | null;
          status: string | null;
          priority: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          user_email?: string | null;
          email?: string | null;
          subject?: string | null;
          message?: string | null;
          status?: string | null;
          priority?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          user_email?: string | null;
          email?: string | null;
          subject?: string | null;
          message?: string | null;
          status?: string | null;
          priority?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      system_config: {
        Row: {
          id: string;
          is_maintenance: boolean | null;
          legal_text: string | null;
          brand_logo: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          is_maintenance?: boolean | null;
          legal_text?: string | null;
          brand_logo?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          is_maintenance?: boolean | null;
          legal_text?: string | null;
          brand_logo?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          company_id: string | null;
          project_id: string | null;
          assigned_to: string | null;
          title: string;
          description: string | null;
          status: string | null;
          due_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          status?: string | null;
          due_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          status?: string | null;
          due_date?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          company_id: string;
          project_id: string | null;
          user_id: string;
          description: string | null;
          hours: number | null;
          date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          project_id?: string | null;
          user_id: string;
          description?: string | null;
          hours?: number | null;
          date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          project_id?: string | null;
          user_id?: string;
          description?: string | null;
          hours?: number | null;
          date?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          type: string;
          amount: number | null;
          category: string | null;
          description: string | null;
          date: string | null;
          status: string | null;
          project_id: string | null;
          owner_id: string | null;
          company_id: string | null;
          receipt_urls: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          amount?: number | null;
          category?: string | null;
          description?: string | null;
          date?: string | null;
          status?: string | null;
          project_id?: string | null;
          owner_id?: string | null;
          company_id?: string | null;
          receipt_urls?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          amount?: number | null;
          category?: string | null;
          description?: string | null;
          date?: string | null;
          status?: string | null;
          project_id?: string | null;
          owner_id?: string | null;
          company_id?: string | null;
          receipt_urls?: any | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      video_calls: {
        Row: {
          id: string;
          host_id: string | null;
          room_name: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          host_id?: string | null;
          room_name?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          host_id?: string | null;
          room_name?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      whiteboard_exports: {
        Row: {
          id: string;
          company_id: string | null;
          project_id: string | null;
          image_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          image_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          project_id?: string | null;
          image_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
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
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
