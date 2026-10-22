import type { DbStatus, RegisteredUser } from './types';

const API_BASE = '/api';

export async function fetchDbStatus(): Promise<DbStatus> {
  try {
    const res = await fetch(`${API_BASE}/admin/db-status`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    return {
      status: 'error',
      type: 'Offline / Connecting...',
      is_neon: false,
      error: err instanceof Error ? err.message : 'Failed to reach API server',
      total_users: 0
    };
  }
}

export async function fetchUsers(): Promise<RegisteredUser[]> {
  const res = await fetch(`${API_BASE}/admin/users`);
  if (!res.ok) {
    throw new Error('Failed to fetch user list from database.');
  }
  return await res.json();
}

export async function createDbUser(userData: {
  username: string;
  name?: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  place?: string;
  role: string;
}): Promise<RegisteredUser> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create user in database.');
  }

  return await res.json();
}

export async function updateDbUser(
  id: number,
  userData: {
    username?: string;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    dob?: string;
    place?: string;
    role?: string;
  }
): Promise<RegisteredUser> {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update user record.');
  }

  return await res.json();
}

export async function deleteDbUser(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete user.');
  }

  return true;
}
