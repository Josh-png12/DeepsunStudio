export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberRole = 'admin' | 'investor'
export type AgreementStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type ProjectStatus = 'potential' | 'proposal' | 'negotiation' | 'contracted' | 'active' | 'paused' | 'completed' | 'cancelled'
export type ProjectHealthStatus = 'on_track' | 'attention' | 'blocked'
export type ProjectUpdateVisibility = 'internal' | 'investor'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
export type BlockerSeverity = 'low' | 'medium' | 'high'
export type BlockerStatus = 'open' | 'resolved'
export type TransactionType = 'income' | 'cost' | 'refund' | 'chargeback' | 'adjustment'
export type TransactionStatus = 'draft' | 'pending' | 'confirmed' | 'reversed'
export type ParticipationStatus = 'calculated' | 'approved' | 'paid' | 'adjusted'
export type DocumentType = 'contract' | 'invoice' | 'receipt' | 'payment_proof' | 'report' | 'other'
export type UpdateVisibility = 'members' | 'admin_only'

export interface Profile {
  id: string
  full_name: string
  role: MemberRole
  avatar_url: string | null
  document_type: string | null
  document_number: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Agreement {
  id: string
  name: string
  status: AgreementStatus
  initial_contribution: number
  participation_percentage: number
  contractual_cap: number
  start_date: string
  end_date: string | null
  currency: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface AgreementMember {
  agreement_id: string
  user_id: string
  role: MemberRole
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  agreement_id: string
  name: string
  description: string | null
  client_name: string | null
  status: ProjectStatus
  estimated_value: number | null
  started_at: string | null
  completed_at: string | null
  slug: string
  public_name: string
  client_public_name: string | null
  service_type: string | null
  progress_percent: number
  estimated_start_date: string | null
  estimated_end_date: string | null
  actual_start_date: string | null
  investor_visible: boolean
  next_step: string | null
  current_focus: string | null
  health_status: ProjectHealthStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProjectInternalDetail {
  project_id: string
  agreement_id: string
  internal_notes: string | null
  updated_by: string
  created_at: string
  updated_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  agreement_id: string
  title: string
  summary: string
  detail: string | null
  progress_percent: number | null
  status: ProjectStatus | null
  current_focus: string | null
  next_step: string | null
  visibility: ProjectUpdateVisibility
  is_highlight: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectMilestone {
  id: string
  project_id: string
  agreement_id: string
  title: string
  description: string | null
  status: MilestoneStatus
  sort_order: number
  target_date: string | null
  completed_at: string | null
  investor_visible: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectBlocker {
  id: string
  project_id: string
  agreement_id: string
  title: string
  description: string
  severity: BlockerSeverity
  status: BlockerStatus
  investor_visible: boolean
  resolved_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  agreement_id: string
  project_id: string | null
  type: TransactionType
  amount: number
  currency: string
  effective_date: string
  status: TransactionStatus
  description: string
  reason: string | null
  support_document_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Participation {
  id: string
  agreement_id: string
  project_id: string
  investor_id: string
  gross_income: number
  deductible_costs: number
  refunds: number
  chargebacks: number
  adjustments: number
  net_profit: number
  percentage: number
  amount: number
  status: ParticipationStatus
  calculated_at: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  agreement_id: string
  investor_id: string
  participation_id: string | null
  amount: number
  payment_date: string
  payment_method: string
  reference: string | null
  document_id: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface PortalDocument {
  id: string
  agreement_id: string
  project_id: string | null
  uploaded_by: string
  type: DocumentType
  name: string
  storage_path: string
  mime_type: string
  size: number
  investor_visible: boolean
  created_at: string
  updated_at: string
}

export interface PortalUpdate {
  id: string
  agreement_id: string
  project_id: string | null
  title: string
  content: string
  visibility: UpdateVisibility
  created_by: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  agreement_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  previous_data: Json | null
  new_data: Json | null
  reason: string | null
  investor_visible: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  agreement_id: string | null
  type: string
  title: string
  message: string
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface UserPreference {
  user_id: string
  notify_income: boolean
  notify_participation: boolean
  notify_payment: boolean
  notify_document: boolean
  notify_update: boolean
  notification_frequency: 'immediate' | 'daily' | 'weekly'
  locale: string
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface PersonalExpense {
  id: string
  user_id: string
  kind: 'income' | 'expense'
  category: string
  concept: string
  amount: number
  occurred_on: string
  created_at: string
  updated_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  saved_amount: number
  target_date: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  due_at: string
  status: 'pending' | 'completed' | 'cancelled'
  note: string | null
  created_at: string
  updated_at: string
}

export interface PublicLead {
  id: string
  business_type: string
  needs: string[]
  budget: string
  timeline: string
  name: string
  email: string
  whatsapp: string | null
  message: string | null
  created_at: string
}

export interface PublicTestimonial {
  id: string
  name: string
  company: string | null
  role: string | null
  message: string
  rating: number
  avatar_url: string | null
  result_image_url: string | null
  video_url: string | null
  approved: boolean
  featured: boolean
  created_at: string
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      leads: Table<PublicLead, Omit<PublicLead, 'id' | 'created_at'> & { id?: string; created_at?: string }>
      testimonials: Table<PublicTestimonial, Omit<PublicTestimonial, 'id' | 'created_at' | 'featured'> & { id?: string; created_at?: string; featured?: boolean }>
      profiles: Table<Profile, Omit<Profile, 'created_at' | 'updated_at'> & Partial<Pick<Profile, 'created_at' | 'updated_at'>>>
      agreements: Table<Agreement, Omit<Agreement, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      agreement_members: Table<AgreementMember, Omit<AgreementMember, 'created_at' | 'updated_at'> & Partial<Pick<AgreementMember, 'created_at' | 'updated_at'>>>
      projects: Table<Project, Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      project_internal_details: Table<ProjectInternalDetail, Omit<ProjectInternalDetail, 'created_at' | 'updated_at'> & Partial<Pick<ProjectInternalDetail, 'created_at' | 'updated_at'>>>
      project_updates: Table<ProjectUpdate, Omit<ProjectUpdate, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      project_milestones: Table<ProjectMilestone, Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      project_blockers: Table<ProjectBlocker, Omit<ProjectBlocker, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      transactions: Table<Transaction, Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      participations: Table<Participation, Omit<Participation, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      payments: Table<Payment, Omit<Payment, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      documents: Table<PortalDocument, Omit<PortalDocument, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      updates: Table<PortalUpdate, Omit<PortalUpdate, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      audit_logs: Table<AuditLog, Omit<AuditLog, 'id' | 'created_at'> & { id?: string; created_at?: string }>
      notifications: Table<Notification, Omit<Notification, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      user_preferences: Table<UserPreference, Omit<UserPreference, 'created_at' | 'updated_at'> & Partial<Pick<UserPreference, 'created_at' | 'updated_at'>>>
      personal_expenses: Table<PersonalExpense, Omit<PersonalExpense, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      savings_goals: Table<SavingsGoal, Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
      reminders: Table<Reminder, Omit<Reminder, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }>
    }
    Views: Record<string, never>
    Functions: {
      calculate_project_participation: {
        Args: { p_project_id: string; p_investor_id: string; p_reason?: string }
        Returns: string
      }
      is_agreement_admin: { Args: { p_agreement_id: string }; Returns: boolean }
      is_agreement_member: { Args: { p_agreement_id: string }; Returns: boolean }
      project_accepts_financials: { Args: { p_project_id: string | null }; Returns: boolean }
    }
    Enums: {
      member_role: MemberRole
      agreement_status: AgreementStatus
      project_status: ProjectStatus
      project_health_status: ProjectHealthStatus
      project_update_visibility: ProjectUpdateVisibility
      milestone_status: MilestoneStatus
      blocker_severity: BlockerSeverity
      blocker_status: BlockerStatus
      transaction_type: TransactionType
      transaction_status: TransactionStatus
      participation_status: ParticipationStatus
      document_type: DocumentType
      update_visibility: UpdateVisibility
    }
    CompositeTypes: Record<string, never>
  }
}
