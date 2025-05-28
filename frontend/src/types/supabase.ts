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
      goal_progress: {
        Row: {
          actual_value: number | null
          goal_id: string | null
          id: string
          synced_at: string | null
        }
        Insert: {
          actual_value?: number | null
          goal_id?: string | null
          id?: string
          synced_at?: string | null
        }
        Update: {
          actual_value?: number | null
          goal_id?: string | null
          id?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_sources: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      goal_templates: {
        Row: {
          aggregation_method: string | null
          auto_generate: boolean | null
          created_at: string | null
          field_name: string
          id: string
          metadata: Json | null
          name: string
          recurrence: string
          source_id: string | null
          target_value: number
          unit: string | null
          user_id: string | null
        }
        Insert: {
          aggregation_method?: string | null
          auto_generate?: boolean | null
          created_at?: string | null
          field_name: string
          id?: string
          metadata?: Json | null
          name: string
          recurrence: string
          source_id?: string | null
          target_value: number
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          aggregation_method?: string | null
          auto_generate?: boolean | null
          created_at?: string | null
          field_name?: string
          id?: string
          metadata?: Json | null
          name?: string
          recurrence?: string
          source_id?: string | null
          target_value?: number
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_templates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "goal_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          target_value: number
          template_id: string | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          target_value: number
          template_id?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          target_value?: number
          template_id?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          auth_type: Database["public"]["Enums"]["auth_type"] | null
          id: string
          logo: string | null
          name: string
          type: Database["public"]["Enums"]["integration_type"] | null
        }
        Insert: {
          auth_type?: Database["public"]["Enums"]["auth_type"] | null
          id?: string
          logo?: string | null
          name: string
          type?: Database["public"]["Enums"]["integration_type"] | null
        }
        Update: {
          auth_type?: Database["public"]["Enums"]["auth_type"] | null
          id?: string
          logo?: string | null
          name?: string
          type?: Database["public"]["Enums"]["integration_type"] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          from: string | null
          id: string
          is_read: boolean
          read_at: string | null
          resource_name: string | null
          resource_params: Json | null
          resource_path: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from?: string | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          resource_name?: string | null
          resource_params?: Json | null
          resource_path: string
          type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          from?: string | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          resource_name?: string | null
          resource_params?: Json | null
          resource_path?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_integrations: {
        Row: {
          client_id: string | null
          integration: string
          organization: string
          secret_key: string | null
        }
        Insert: {
          client_id?: string | null
          integration: string
          organization: string
          secret_key?: string | null
        }
        Update: {
          client_id?: string | null
          integration?: string
          organization?: string
          secret_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_organization_integrations_integration_fkey"
            columns: ["integration"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_organization_integrations_organization_fkey"
            columns: ["organization"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          default_assumptions: string | null
          default_template: number | null
          id: string
          labor_rate: number
          name: string
          slug: string | null
          visibility_settings: Json
        }
        Insert: {
          default_assumptions?: string | null
          default_template?: number | null
          id?: string
          labor_rate: number
          name: string
          slug?: string | null
          visibility_settings?: Json
        }
        Update: {
          default_assumptions?: string | null
          default_template?: number | null
          id?: string
          labor_rate?: number
          name?: string
          slug?: string | null
          visibility_settings?: Json
        }
        Relationships: []
      }
      phase_templates: {
        Row: {
          bill_phase_separately: boolean | null
          created_at: string
          created_by: string
          description: string
          id: string
          mark_as_milestone_flag: boolean
          order: number
          template_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          bill_phase_separately?: boolean | null
          created_at?: string
          created_by?: string
          description: string
          id?: string
          mark_as_milestone_flag?: boolean
          order: number
          template_id: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          bill_phase_separately?: boolean | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          mark_as_milestone_flag?: boolean
          order?: number
          template_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_template_phases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          description: string
          hours: number
          id: string
          order: number
          reference_id: number | null
          version: string
          visible: boolean | null
        }
        Insert: {
          description: string
          hours?: number
          id?: string
          order?: number
          reference_id?: number | null
          version: string
          visible?: boolean | null
        }
        Update: {
          description?: string
          hours?: number
          id?: string
          order?: number
          reference_id?: number | null
          version?: string
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "public_phases_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "public_phases_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          created_at: string
          id: string
          phone_number: string
          released_at: string | null
          status: string | null
          twilio_sid: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          phone_number: string
          released_at?: string | null
          status?: string | null
          twilio_sid: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          phone_number?: string
          released_at?: string | null
          status?: string | null
          twilio_sid?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_items: {
        Row: {
          created_at: string
          helper_name: string
          id: string
          identifier: string
          params: Json
          path: string
          record_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helper_name: string
          id?: string
          identifier: string
          params: Json
          path: string
          record_type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          helper_name?: string
          id?: string
          identifier?: string
          params?: Json
          path?: string
          record_type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_overrides: Json | null
          calculated_cost: number | null
          calculated_price: number | null
          catalog_item: number | null
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          extended_cost: number | null
          extended_price: number | null
          id: number | null
          identifier: string | null
          manufacturer_part_number: string | null
          order: number
          parent: string | null
          parent_catalog_item: number | null
          price: number | null
          product_class: string | null
          quantity: number
          recurring_bill_cycle: number | null
          recurring_cost: number | null
          recurring_cycle_type: string | null
          recurring_flag: boolean | null
          section: string | null
          sequence_number: number | null
          taxable_flag: boolean | null
          type: string | null
          unique_id: string
          unit_of_measure: string | null
          vendor: string | null
          version: string
        }
        Insert: {
          additional_overrides?: Json | null
          calculated_cost?: number | null
          calculated_price?: number | null
          catalog_item?: number | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          extended_cost?: number | null
          extended_price?: number | null
          id?: number | null
          identifier?: string | null
          manufacturer_part_number?: string | null
          order?: number
          parent?: string | null
          parent_catalog_item?: number | null
          price?: number | null
          product_class?: string | null
          quantity?: number
          recurring_bill_cycle?: number | null
          recurring_cost?: number | null
          recurring_cycle_type?: string | null
          recurring_flag?: boolean | null
          section?: string | null
          sequence_number?: number | null
          taxable_flag?: boolean | null
          type?: string | null
          unique_id?: string
          unit_of_measure?: string | null
          vendor?: string | null
          version: string
        }
        Update: {
          additional_overrides?: Json | null
          calculated_cost?: number | null
          calculated_price?: number | null
          catalog_item?: number | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          extended_cost?: number | null
          extended_price?: number | null
          id?: number | null
          identifier?: string | null
          manufacturer_part_number?: string | null
          order?: number
          parent?: string | null
          parent_catalog_item?: number | null
          price?: number | null
          product_class?: string | null
          quantity?: number
          recurring_bill_cycle?: number | null
          recurring_cost?: number | null
          recurring_cycle_type?: string | null
          recurring_flag?: boolean | null
          section?: string | null
          sequence_number?: number | null
          taxable_flag?: boolean | null
          type?: string | null
          unique_id?: string
          unit_of_measure?: string | null
          vendor?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_products_2_parent_fkey"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["unique_id"]
          },
          {
            foreignKeyName: "public_products_section_fkey"
            columns: ["section"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_products_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "public_products_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_keys: {
        Row: {
          key: string
          user_id: string
        }
        Insert: {
          key: string
          user_id: string
        }
        Update: {
          key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact_id: number | null
          date_updated: string
          first_name: string | null
          id: string
          image_url: string | null
          last_name: string | null
          organization: string | null
          system_member_id: number | null
          updated_at: string | null
          username: string | null
          worker_sid: string
        }
        Insert: {
          contact_id?: number | null
          date_updated?: string
          first_name?: string | null
          id: string
          image_url?: string | null
          last_name?: string | null
          organization?: string | null
          system_member_id?: number | null
          updated_at?: string | null
          username?: string | null
          worker_sid: string
        }
        Update: {
          contact_id?: number | null
          date_updated?: string
          first_name?: string | null
          id?: string
          image_url?: string | null
          last_name?: string | null
          organization?: string | null
          system_member_id?: number | null
          updated_at?: string | null
          username?: string | null
          worker_sid?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_fkey"
            columns: ["organization"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_followers: {
        Row: {
          proposal_id: string
          user_id: string
        }
        Insert: {
          proposal_id: string
          user_id: string
        }
        Update: {
          proposal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_followers_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["proposal_id"]
          },
          {
            foreignKeyName: "proposal_followers_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_settings: {
        Row: {
          assumptions: string | null
          description: string | null
          proposal: string
          version: string
        }
        Insert: {
          assumptions?: string | null
          description?: string | null
          proposal: string
          version: string
        }
        Update: {
          assumptions?: string | null
          description?: string | null
          proposal?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_proposal_fkey"
            columns: ["proposal"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["proposal_id"]
          },
          {
            foreignKeyName: "settings_proposal_fkey"
            columns: ["proposal"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "settings_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          reference_id: number | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name: string
          reference_id?: number | null
          updated_at?: string
          updated_by?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          reference_id?: number | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          approval_info: Json | null
          catalog_items: number[] | null
          company: Json | null
          company_id: number | null
          company_name: string | null
          contact: Json | null
          contact_id: number | null
          created_at: string
          created_by: string | null
          date_approved: string | null
          embedding: string | null
          expiration_date: string | null
          fts: unknown | null
          id: string
          is_conversion_completed: boolean
          is_getting_converted: boolean
          labor_hours: number
          labor_rate: number
          name: string
          opportunity_id: number | null
          organization: string | null
          project_id: number | null
          service_ticket: number | null
          status: Database["public"]["Enums"]["status"]
          templates_used: number[] | null
          updated_at: string
          working_version: string | null
        }
        Insert: {
          approval_info?: Json | null
          catalog_items?: number[] | null
          company?: Json | null
          company_id?: number | null
          company_name?: string | null
          contact?: Json | null
          contact_id?: number | null
          created_at?: string
          created_by?: string | null
          date_approved?: string | null
          embedding?: string | null
          expiration_date?: string | null
          fts?: unknown | null
          id?: string
          is_conversion_completed?: boolean
          is_getting_converted?: boolean
          labor_hours?: number
          labor_rate?: number
          name: string
          opportunity_id?: number | null
          organization?: string | null
          project_id?: number | null
          service_ticket?: number | null
          status?: Database["public"]["Enums"]["status"]
          templates_used?: number[] | null
          updated_at?: string
          working_version?: string | null
        }
        Update: {
          approval_info?: Json | null
          catalog_items?: number[] | null
          company?: Json | null
          company_id?: number | null
          company_name?: string | null
          contact?: Json | null
          contact_id?: number | null
          created_at?: string
          created_by?: string | null
          date_approved?: string | null
          embedding?: string | null
          expiration_date?: string | null
          fts?: unknown | null
          id?: string
          is_conversion_completed?: boolean
          is_getting_converted?: boolean
          labor_hours?: number
          labor_rate?: number
          name?: string
          opportunity_id?: number | null
          organization?: string | null
          project_id?: number | null
          service_ticket?: number | null
          status?: Database["public"]["Enums"]["status"]
          templates_used?: number[] | null
          updated_at?: string
          working_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_organization_fkey"
            columns: ["organization"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_proposals_working_version_fkey"
            columns: ["working_version"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "public_proposals_working_version_fkey"
            columns: ["working_version"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string
          id: string
          name: string
          order: number
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order?: number
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order?: number
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_sections_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "public_sections_version_fkey"
            columns: ["version"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          author_id: string
          created_at: string | null
          data: Json | null
          id: string
          target_id: string
          target_type: string
          text: string | null
          type: string
        }
        Insert: {
          author_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          target_id: string
          target_type: string
          text?: string | null
          type?: string
        }
        Update: {
          author_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          target_id?: string
          target_type?: string
          text?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_author_id_fkey1"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string
          priority: number
          summary: string
          ticket_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          notes: string
          priority: number
          summary: string
          ticket_id: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string
          priority?: number
          summary?: string
          ticket_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_template_tasks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      taskrouter_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          reservation_sid: string | null
          task_sid: string | null
          worker_sid: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload: Json
          reservation_sid?: string | null
          task_sid?: string | null
          worker_sid?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          reservation_sid?: string | null
          task_sid?: string | null
          worker_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taskrouter_events_worker_sid_fkey"
            columns: ["worker_sid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["worker_sid"]
          },
        ]
      }
      tasks: {
        Row: {
          budget_hours: number | null
          created_at: string
          id: string
          notes: string
          order: number
          priority: number
          reference_id: number | null
          summary: string
          ticket: string
          visible: boolean
        }
        Insert: {
          budget_hours?: number | null
          created_at?: string
          id?: string
          notes: string
          order?: number
          priority: number
          reference_id?: number | null
          summary: string
          ticket: string
          visible?: boolean
        }
        Update: {
          budget_hours?: number | null
          created_at?: string
          id?: string
          notes?: string
          order?: number
          priority?: number
          reference_id?: number | null
          summary?: string
          ticket?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "tasks_ticket_fkey"
            columns: ["ticket"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          description: string | null
          edit_team_name_or_description_access_level: string | null
          edit_team_visibility_or_trash_team_access_level: string | null
          endorsed: boolean | null
          guest_invite_management_access_level: string | null
          id: string
          join_request_management_access_level: string | null
          member_invite_management_access_level: string | null
          name: string
          permalink_url: string | null
          team_content_management_access_level: string | null
          team_member_removal_access_level: string | null
          visibility: string | null
        }
        Insert: {
          description?: string | null
          edit_team_name_or_description_access_level?: string | null
          edit_team_visibility_or_trash_team_access_level?: string | null
          endorsed?: boolean | null
          guest_invite_management_access_level?: string | null
          id?: string
          join_request_management_access_level?: string | null
          member_invite_management_access_level?: string | null
          name: string
          permalink_url?: string | null
          team_content_management_access_level?: string | null
          team_member_removal_access_level?: string | null
          visibility?: string | null
        }
        Update: {
          description?: string | null
          edit_team_name_or_description_access_level?: string | null
          edit_team_visibility_or_trash_team_access_level?: string | null
          endorsed?: boolean | null
          guest_invite_management_access_level?: string | null
          id?: string
          join_request_management_access_level?: string | null
          member_invite_management_access_level?: string | null
          name?: string
          permalink_url?: string | null
          team_content_management_access_level?: string | null
          team_member_removal_access_level?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      ticket_templates: {
        Row: {
          budgetHours: number
          created_at: string
          created_by: string
          id: string
          order: number
          phase_id: string
          summary: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          budgetHours: number
          created_at?: string
          created_by?: string
          id?: string
          order: number
          phase_id: string
          summary: string
          updated_at?: string
          updated_by?: string
        }
        Update: {
          budgetHours?: number
          created_at?: string
          created_by?: string
          id?: string
          order?: number
          phase_id?: string
          summary?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_template_tickets_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phase_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          budget_hours: number
          created_at: string
          id: string
          order: number
          phase: string
          reference_id: number | null
          summary: string
          visible: boolean
        }
        Insert: {
          budget_hours?: number
          created_at?: string
          id?: string
          order: number
          phase: string
          reference_id?: number | null
          summary: string
          visible?: boolean
        }
        Update: {
          budget_hours?: number
          created_at?: string
          id?: string
          order?: number
          phase?: string
          reference_id?: number | null
          summary?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_tickets_phase_fkey"
            columns: ["phase"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          created_at: string
          id: string
          number: number | null
          proposal: string
        }
        Insert: {
          created_at?: string
          id?: string
          number?: number | null
          proposal: string
        }
        Update: {
          created_at?: string
          id?: string
          number?: number | null
          proposal?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_versions_proposal_fkey"
            columns: ["proposal"]
            isOneToOne: false
            referencedRelation: "proposal_totals"
            referencedColumns: ["proposal_id"]
          },
          {
            foreignKeyName: "public_versions_proposal_fkey"
            columns: ["proposal"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      calculate_totals: {
        Row: {
          labor_total: number | null
          total_cost: number | null
          total_price: number | null
          total_product: number | null
          total_recurring: number | null
        }
        Relationships: []
      }
      proposal_totals: {
        Row: {
          labor_cost: number | null
          labor_rate: number | null
          non_recurring_product_cost: number | null
          non_recurring_product_total: number | null
          proposal_id: string | null
          recurring_cost: number | null
          recurring_total: number | null
          total_hours: number | null
          total_price: number | null
          version_id: string | null
          version_number: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      convert_to_manage: {
        Args: { proposal_id: string }
        Returns: undefined
      }
      copy_version_data: {
        Args: { old_version: string; new_version: string }
        Returns: undefined
      }
      create_manage_opportunity: {
        Args: { proposal_id: string }
        Returns: string
      }
      create_manage_project: {
        Args: { opportunity_id: number }
        Returns: string
      }
      create_new_phase: {
        Args: { old_phase_id: string; new_version_id?: string }
        Returns: string
      }
      create_new_product: {
        Args: {
          old_product_id: string
          new_version: string
          new_section?: string
        }
        Returns: string
      }
      create_new_task: {
        Args: { old_task_id: string; new_ticket_id: string }
        Returns: string
      }
      create_new_ticket: {
        Args: { old_ticket_id: string; new_phase_id: string }
        Returns: string
      }
      create_opportunity_products: {
        Args:
          | { opportunity_id: number }
          | { opportunity_id: number; version_id: string }
        Returns: Json
      }
      create_phase_ticket: {
        Args: { ticket_id: string; phase_id: number }
        Returns: string
      }
      create_project_phase: {
        Args: { phase_id: string; project_id: number }
        Returns: string
      }
      create_ticket_task: {
        Args: { task_id: string; ticket_id: number }
        Returns: string
      }
      delete_non_working_versions_for_old_proposals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      duplicate_phases: {
        Args: { old_version: string; new_version: string }
        Returns: string[]
      }
      duplicate_products: {
        Args: { original_id: string; new_id: string }
        Returns: undefined
      }
      duplicate_tasks: {
        Args: { original_id: string; new_id: string }
        Returns: undefined
      }
      duplicate_tickets: {
        Args: { original_id: string; new_id: string }
        Returns: undefined
      }
      get_member: {
        Args: { email: string }
        Returns: number
      }
      get_opportunity_products: {
        Args: { opportunity_id: number }
        Returns: {
          id: number
          catalogitem: number
        }[]
      }
      get_organization_from_phase: {
        Args: { phase_id: string }
        Returns: {
          id: string
          name: string
          labor_rate: number
          slug: string
          default_template: number
          visibility_settings: Json
        }[]
      }
      hybrid_search: {
        Args: {
          query_text: string
          query_embedding: string
          match_count: number
          full_text_weight?: number
          semantic_weight?: number
          rrf_k?: number
        }
        Returns: {
          approval_info: Json | null
          catalog_items: number[] | null
          company: Json | null
          company_id: number | null
          company_name: string | null
          contact: Json | null
          contact_id: number | null
          created_at: string
          created_by: string | null
          date_approved: string | null
          embedding: string | null
          expiration_date: string | null
          fts: unknown | null
          id: string
          is_conversion_completed: boolean
          is_getting_converted: boolean
          labor_hours: number
          labor_rate: number
          name: string
          opportunity_id: number | null
          organization: string | null
          project_id: number | null
          service_ticket: number | null
          status: Database["public"]["Enums"]["status"]
          templates_used: number[] | null
          updated_at: string
          working_version: string | null
        }[]
      }
      is_organization_member: {
        Args: { organization_id: string; user_id: string }
        Returns: boolean
      }
      is_proposal_shared: {
        Args: { proposal_id: string; user_id: string }
        Returns: boolean
      }
      jsonb_diff_val: {
        Args: { val1: Json; val2: Json }
        Returns: Json
      }
      phase_loop: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      read_secret: {
        Args: { secret_name: string }
        Returns: string
      }
      slugify: {
        Args: { value: string }
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_manage_product: {
        Args:
          | { o_prod_id: number; price: number; cost: number }
          | { o_prod_id: number; price: number; cost: number; quantity: number }
        Returns: undefined
      }
    }
    Enums: {
      auth_type: "OAuth2" | "Basic"
      integration_type: "reseller" | "distribution" | "email"
      status: "building" | "inProgress" | "signed" | "canceled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  reporting: {
    Tables: {
      conversations: {
        Row: {
          abandon_time: number | null
          abandoned: string | null
          abandoned_phase: string | null
          agent: string | null
          communication_channel: string | null
          company_id: number | null
          contact_id: number | null
          date: string
          direction: string | null
          hold_time: number | null
          id: string
          in_business_hours: boolean | null
          outcome: string | null
          phone_number: string | null
          queue: string | null
          queue_time: number | null
          talk_time: number | null
          workflow: string | null
        }
        Insert: {
          abandon_time?: number | null
          abandoned?: string | null
          abandoned_phase?: string | null
          agent?: string | null
          communication_channel?: string | null
          company_id?: number | null
          contact_id?: number | null
          date?: string
          direction?: string | null
          hold_time?: number | null
          id: string
          in_business_hours?: boolean | null
          outcome?: string | null
          phone_number?: string | null
          queue?: string | null
          queue_time?: number | null
          talk_time?: number | null
          workflow?: string | null
        }
        Update: {
          abandon_time?: number | null
          abandoned?: string | null
          abandoned_phase?: string | null
          agent?: string | null
          communication_channel?: string | null
          company_id?: number | null
          contact_id?: number | null
          date?: string
          direction?: string | null
          hold_time?: number | null
          id?: string
          in_business_hours?: boolean | null
          outcome?: string | null
          phone_number?: string | null
          queue?: string | null
          queue_time?: number | null
          talk_time?: number | null
          workflow?: string | null
        }
        Relationships: []
      }
      engagement_reservations: {
        Row: {
          created_at: string
          enagement_id: string
          id: string
          reservation_status: string
          worker_sid: string
        }
        Insert: {
          created_at?: string
          enagement_id: string
          id: string
          reservation_status: string
          worker_sid: string
        }
        Update: {
          created_at?: string
          enagement_id?: string
          id?: string
          reservation_status?: string
          worker_sid?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_reservations_enagement_id_fkey"
            columns: ["enagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          attributes: Json | null
          channel: string
          company: Json | null
          contact: Json | null
          created_at: string
          follow_up_engagement_id: string | null
          id: string
          is_canceled: boolean | null
          is_inbound: boolean
          is_voicemail: boolean | null
          recording_url: string | null
          transcription_sid: string | null
          workspace_sid: string | null
        }
        Insert: {
          attributes?: Json | null
          channel?: string
          company?: Json | null
          contact?: Json | null
          created_at?: string
          follow_up_engagement_id?: string | null
          id: string
          is_canceled?: boolean | null
          is_inbound?: boolean
          is_voicemail?: boolean | null
          recording_url?: string | null
          transcription_sid?: string | null
          workspace_sid?: string | null
        }
        Update: {
          attributes?: Json | null
          channel?: string
          company?: Json | null
          contact?: Json | null
          created_at?: string
          follow_up_engagement_id?: string | null
          id?: string
          is_canceled?: boolean | null
          is_inbound?: boolean
          is_voicemail?: boolean | null
          recording_url?: string | null
          transcription_sid?: string | null
          workspace_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagements_follow_up_engagement_id_fkey"
            columns: ["follow_up_engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      abandoned_conversations_by_day: {
        Row: {
          abandoned_count: number | null
          average_abandon_time: number | null
          conversation_date: string | null
        }
        Relationships: []
      }
      call_summary_by_period: {
        Row: {
          call_date: string | null
          channel: string | null
          inbound_engagements: number | null
          outbound_engagements: number | null
          total_engagements: number | null
          voicemails: number | null
        }
        Relationships: []
      }
      calls_by_agent: {
        Row: {
          agent: string | null
          inbound_calls: number | null
          outbound_calls: number | null
        }
        Relationships: []
      }
      calls_by_agent_by_day: {
        Row: {
          agent: string | null
          date: string | null
          inbound_calls: number | null
          outbound_calls: number | null
          total_conversations: number | null
          total_talk_time: number | null
        }
        Relationships: []
      }
      calls_summary_by_day: {
        Row: {
          call_date: string | null
          inbound_conversations: number | null
          outbound_conversations: number | null
          total_calls: number | null
          total_talk_time: number | null
        }
        Relationships: []
      }
      conversations_by_agent_by_day: {
        Row: {
          agent: string | null
          conversation_date: string | null
          inbound_conversations: number | null
          outbound_conversations: number | null
          total_conversations: number | null
          total_talk_time: number | null
        }
        Relationships: []
      }
      conversations_summary_by_day: {
        Row: {
          conversation_date: string | null
          inbound_conversations: number | null
          outbound_conversations: number | null
          total_conversations: number | null
          voicemail_count: number | null
        }
        Relationships: []
      }
      handle_time_by_day: {
        Row: {
          average_abandon_time: number | null
          average_handling_time: number | null
          average_queue_time: number | null
          conversation_date: string | null
        }
        Relationships: []
      }
      handle_time_by_day_test: {
        Row: {
          average_abandon_time: number | null
          average_handling_time: number | null
          average_queue_time: number | null
          conversation_date: string | null
        }
        Relationships: []
      }
      voicemails_by_day: {
        Row: {
          voicemail_count: number | null
          voicemail_date: string | null
        }
        Relationships: []
      }
      voicemails_by_month: {
        Row: {
          voicemail_count: number | null
          voicemail_month: string | null
        }
        Relationships: []
      }
      voicemails_left_by_day: {
        Row: {
          date: string | null
          voicemail_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      search_number: {
        Args: { phone_number: string }
        Returns: {
          userid: number
          companyid: number
          name: string
          territoryname: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  taskrouter: {
    Tables: {
      blacklisted_phone_numbers: {
        Row: {
          number: string
          organization_id: string
        }
        Insert: {
          number: string
          organization_id: string
        }
        Update: {
          number?: string
          organization_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          reservation_sid: string
          task_sid: string
        }
        Insert: {
          created_at?: string
          reservation_sid: string
          task_sid: string
        }
        Update: {
          created_at?: string
          reservation_sid?: string
          task_sid?: string
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
  user_experience: {
    Tables: {
      views: {
        Row: {
          created_at: string
          creator: string | null
          filters: Json
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          creator?: string | null
          filters: Json
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          creator?: string | null
          filters?: Json
          id?: string
          name?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      auth_type: ["OAuth2", "Basic"],
      integration_type: ["reseller", "distribution", "email"],
      status: ["building", "inProgress", "signed", "canceled"],
    },
  },
  reporting: {
    Enums: {},
  },
  taskrouter: {
    Enums: {},
  },
  user_experience: {
    Enums: {},
  },
} as const

