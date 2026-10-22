import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { AdminNavbar } from '../components/AdminNavbar';
import type { RegisteredUser, DbStatus, UserRole } from '../lib/types';
import { fetchDbStatus, fetchUsers, createDbUser, updateDbUser, deleteDbUser } from '../lib/api';

export function AdminDashboardPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formPlace, setFormPlace] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<RegisteredUser | null>(null);

  // Load Database Status & Users
  const loadData = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const [statusData, usersData] = await Promise.all([
        fetchDbStatus(),
        fetchUsers().catch(() => [])
      ]);
      setDbStatus(statusData);
      setUsers(usersData);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to connect to backend server.'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Test / Refresh DB Status
  const handleRefreshDb = async () => {
    setIsRefreshingDb(true);
    try {
      const statusData = await fetchDbStatus();
      setDbStatus(statusData);
      const usersData = await fetchUsers();
      setUsers(usersData);
      setFeedback({
        type: 'success',
        message: `Database connection verified! ${statusData.is_neon ? 'Connected to Neon PostgreSQL' : 'Connected to Local Database'}.`
      });
    } catch {
      setFeedback({ type: 'error', message: 'Database connection check failed.' });
    } finally {
      setIsRefreshingDb(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Filtered Users with full multi-field search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        u.username.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.place && u.place.toLowerCase().includes(q));

      const matchRole = selectedRole === 'all' || u.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormDob('');
    setFormPlace('');
    setFormPassword('');
    setFormRole('farmer');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (user: RegisteredUser) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormDob(user.dob || '');
    setFormPlace(user.place || '');
    setFormPassword(''); // blank means keep existing
    setFormRole((user.role as UserRole) || 'farmer');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Submit User (Create or Update)
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      setFeedback({ type: 'error', message: 'Username is required.' });
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'A valid email address is required.' });
      return;
    }
    if (!editingUser && (!formPassword || formPassword.length < 4)) {
      setFeedback({ type: 'error', message: 'Password must be at least 4 characters.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingUser) {
        // Update user
        const updatePayload: {
          username: string;
          name?: string;
          email: string;
          phone?: string;
          dob?: string;
          place?: string;
          role: string;
          password?: string;
        } = {
          username: formUsername.trim(),
          name: formName.trim() || formUsername.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          dob: formDob.trim() || undefined,
          place: formPlace.trim() || undefined,
          role: formRole
        };
        if (formPassword.trim()) {
          updatePayload.password = formPassword.trim();
        }

        const updated = await updateDbUser(editingUser.id, updatePayload);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setFeedback({ type: 'success', message: `User "${updated.username}" updated successfully in Neon DB!` });
      } else {
        // Create user
        const created = await createDbUser({
          username: formUsername.trim(),
          name: formName.trim() || formUsername.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || undefined,
          dob: formDob.trim() || undefined,
          place: formPlace.trim() || undefined,
          password: formPassword.trim(),
          role: formRole
        });
        setUsers((prev) => [created, ...prev]);
        setFeedback({ type: 'success', message: `User "${created.username}" successfully entered into Neon DB!` });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Database operation failed.'
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: RegisteredUser) => {
    try {
      await deleteDbUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteConfirmUser(null);
      setFeedback({ type: 'success', message: `User "${user.username}" deleted from database.` });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete user.'
      });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 transition-colors font-sans pb-24">
      {/* Top Navbar */}
      <AdminNavbar dbStatus={dbStatus} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Banner Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-mono flex items-center space-x-2.5 transition-all shadow-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/80'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span className="flex-1">{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Database & System Health Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          
          {/* Card 1: Neon Connection Status */}
          <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-neutral-400 mb-1">
              <span>Database Engine</span>
              <button
                type="button"
                onClick={handleRefreshDb}
                disabled={isRefreshingDb}
                className="hover:text-emerald-500 transition-colors cursor-pointer"
                title="Refresh Database Connection"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDb ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.status === 'error' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>Neon PostgreSQL</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1.5 font-mono truncate">
              {dbStatus?.host ? `Host: ${dbStatus.host}` : 'Serverless PostgreSQL Pooler Active'}
            </div>
          </div>

          {/* Card 2: Registered Users Count */}
          <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-neutral-400 mb-1">
              <span>Total Users</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">In Database</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
              {users.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-mono">
              Live records stored in table <code className="text-emerald-600 dark:text-emerald-400">users</code>
            </div>
          </div>

          {/* Card 3: Database Latency & Health */}
          <div className="bg-white dark:bg-neutral-950 border border-slate-200/90 dark:border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-neutral-400 mb-1">
              <span>DB Round-Trip Ping</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Active</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
              {dbStatus?.latency_ms !== undefined ? `${dbStatus.latency_ms} ms` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-mono">
              SSL Mode: require • Pool Pre-Ping
            </div>
          </div>

        </section>

        {/* Main Section: User Management */}
        <section className="bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-sm">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>User Details Management</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Manage registered farmers, agronomists, and administrators stored in Neon DB.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, email, phone, or location..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'all' | UserRole)}
                className="px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-mono text-slate-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="farmer">Farmers</option>
                <option value="agronomist">Agronomists / Scientists</option>
                <option value="admin">Administrators</option>
              </select>

              <button
                type="button"
                onClick={loadData}
                disabled={isLoadingUsers}
                className="p-2 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Refresh Users List"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/60 text-slate-500 dark:text-neutral-400 font-mono uppercase text-[10.5px]">
                    <th className="py-3 px-4 font-bold">User</th>
                    <th className="py-3 px-4 font-bold">Contact</th>
                    <th className="py-3 px-4 font-bold">Location & DOB</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Registered</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-900">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        <div className="inline-flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                          <span>Loading users from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No users found in database matching your criteria.
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
                          >
                            + Click here to add the first user
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors group"
                      >
                        {/* User Identity Column */}
                        <td className="py-3 px-4 text-slate-900 dark:text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600/10 dark:bg-white/10 text-emerald-600 dark:text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {(u.name || u.username).charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {u.name || u.username}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400">
                                @{u.username} <span className="opacity-60">#{u.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Column */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-700 dark:text-neutral-300">
                            {u.email}
                          </div>
                          {u.phone && (
                            <div className="font-mono text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Location & DOB Column */}
                        <td className="py-3 px-4">
                          <div className="text-slate-700 dark:text-neutral-300 flex items-center space-x-1">
                            {u.place ? (
                              <>
                                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span className="truncate max-w-[140px]">{u.place}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
                          </div>
                          {u.dob && (
                            <div className="font-mono text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>DOB: {u.dob}</span>
                            </div>
                          )}
                        </td>

                        {/* Role Column */}
                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                                : u.role === 'agronomist'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Registered Date Column */}
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmUser(u)}
                              className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>

      </main>

      {/* =================================================================== */}
      {/* ADD / EDIT USER MODAL                                              */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl my-8">
            
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {editingUser ? `Edit User: ${editingUser.name || editingUser.username}` : 'Enter New User Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-4">
              
              {/* Row 1: Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Raviteja K"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="e.g. raviteja_kisan"
                      className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Place & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                    Location / Place
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formPlace}
                      onChange={(e) => setFormPlace(e.target.value)}
                      placeholder="e.g. Guntur, Andhra Pradesh"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider">
                    Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? '••••••••••••' : 'Enter password (min 4 chars)'}
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono tracking-wider mb-1">
                  System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['farmer', 'agronomist', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormRole(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-mono uppercase transition-all border cursor-pointer ${
                        formRole === r
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-slate-900 dark:border-white shadow-sm'
                          : 'bg-slate-50 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to DB...' : editingUser ? 'Update User' : 'Save to Neon DB'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                          */}
      {/* =================================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Confirm User Deletion</h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 font-mono">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deleteConfirmUser.username}</span>? This will permanently remove the record from Neon PostgreSQL.
            </p>
            <div className="flex items-center justify-center space-x-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
