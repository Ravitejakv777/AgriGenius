export type AdminRole = 'superadmin' | 'reviewer' | 'kvk_scientist';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  clearanceLevel: 'Level 1 (KVK)' | 'Level 2 (State Agronomist)' | 'Level 3 (National Directorate)';
  department: string;
  station: string;
  lastActive: string;
  queriesAudited: number;
}

export type UserRole = 'farmer' | 'agronomist' | 'admin';

export interface RegisteredUser {
  id: number;
  username: string;
  name?: string;
  email: string;
  phone?: string;
  dob?: string;
  place?: string;
  role: UserRole | string;
  created_at: string;
  updated_at?: string;
}

export interface DbStatus {
  status: 'connected' | 'error' | 'checking';
  type: string;
  is_neon: boolean;
  host?: string;
  latency_ms?: number;
  total_users: number;
  error?: string;
}
