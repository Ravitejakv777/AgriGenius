import type { AdminUser } from './types';

export const DEMO_ADMIN_USERS: Record<string, AdminUser> = {
  superadmin: {
    id: 'ADM-ND-001',
    name: 'Dr. Ravi Teja',
    email: 'admin@agrigenius.gov.in',
    role: 'superadmin',
    clearanceLevel: 'Level 3 (National Directorate)',
    department: 'Central AI & Agronomic Directorate',
    station: 'New Delhi HQ',
    lastActive: 'Just now',
    queriesAudited: 1420
  },
  reviewer: {
    id: 'ADM-AG-042',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@icar.gov.in',
    role: 'reviewer',
    clearanceLevel: 'Level 2 (State Agronomist)',
    department: 'ICAR Plant Protection Unit',
    station: 'Coimbatore, Tamil Nadu',
    lastActive: '8 mins ago',
    queriesAudited: 890
  },
  kvk_scientist: {
    id: 'ADM-KVK-108',
    name: 'Dr. Rajesh Patel',
    email: 'rajesh.patel@kvk.gov.in',
    role: 'kvk_scientist',
    clearanceLevel: 'Level 1 (KVK)',
    department: 'Krishi Vigyan Kendra Field Command',
    station: 'Nashik, Maharashtra',
    lastActive: '24 mins ago',
    queriesAudited: 512
  }
};
