'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Users, 
  X, 
  Sparkles,
  Shield,
  Mail,
  User,
  KeyRound
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES_OFFICER';
  createdAt: string;
}

export default function UsersManagementPage() {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SALES_OFFICER'>('SALES_OFFICER');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error('Failed to load user accounts.');
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'Error occurred fetching user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('SALES_OFFICER');
    setModalOpen(true);
  };

  const openEditModal = (u: UserData) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword(''); // Leave blank by default during edit
    setRole(u.role);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!editingId && !password) || !role) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save user account.');
      }

      toast(
        editingId ? 'User account updated successfully.' : 'New user account created successfully.',
        'success'
      );
      
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user.');
      }

      toast('User account deleted successfully.', 'success');
      fetchUsers();
    } catch (err: any) {
      toast(err.message || 'Deletion failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Loading User Accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Explicitly add, edit, or remove dealership Administrators and Sales Officers.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Main Content Area */}
      {error && users.length === 0 ? (
        <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm">Fetch Error</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No Extra Users Configured</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Get started by adding Sales Officer accounts so they can log sales and view payouts.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/95 transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create First User</span>
          </button>
        </div>
      ) : (
        <>
          {/* User List Table Card - Hidden on Mobile */}
          <div className="hidden md:block bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest border-b border-border/80 bg-muted/20">
                    <th className="py-4 px-6">Staff Member</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Security Role</th>
                    <th className="py-4 px-6">Date Added</th>
                    <th className="py-4 px-6 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-sm text-foreground flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-primary/15 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-muted-foreground font-mono">
                        {u.email}
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          u.role === 'ADMIN' 
                            ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300' 
                            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300'
                        }`}>
                          <span>{u.role.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-muted-foreground font-mono">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-right pr-8">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                handleDelete(u.id);
                              }
                            }}
                            disabled={deletingId === u.id}
                            className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20 cursor-pointer disabled:opacity-50"
                            title="Delete User"
                          >
                            {deletingId === u.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Catalog Cards List - Visible on Mobile Only */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-primary/15 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-extrabold text-sm text-foreground">{u.name}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    u.role === 'ADMIN' 
                      ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300' 
                      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-3.5">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Email Address</span>
                    <span className="font-bold text-foreground font-mono">{u.email}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-border/40 pt-3.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                        handleDelete(u.id);
                      }
                    }}
                    disabled={deletingId === u.id}
                    className="px-3.5 py-1.5 text-xs font-semibold text-destructive border border-destructive/20 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-slide-in">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-rose-500" />
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-extrabold text-md text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>{editingId ? 'Edit User Account' : 'Add User Account'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@dealership.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Password {editingId && <span className="text-[10px] text-zinc-500 font-bold lowercase">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required={!editingId}
                      placeholder={editingId ? '••••••••' : 'Password (min 6 characters)'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Security Authorization Role
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                      <Shield className="h-4 w-4" />
                    </span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SALES_OFFICER')}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="SALES_OFFICER">SALES_OFFICER (Sales Officer)</option>
                      <option value="ADMIN">ADMIN (Dealership Administrator)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-muted transition-colors cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingId ? 'Update User' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
