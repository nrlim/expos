'use client'

import React, { useState } from 'react'
import { createUser, updateUser, deleteUser } from '@/app/actions/user'

interface User {
  id: string
  username: string
  role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'CUSTOM'
  customRoleId?: string | null
  customRole?: { id: string, name: string } | null
  createdAt: Date
}

interface CustomRole {
  id: string
  name: string
}

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
)
const TrashIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const EditIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

const ROLE_LABELS = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  CASHIER: 'Cashier',
}

export function UserManager({ users, currentUserId, customRoles }: { users: User[], currentUserId: string, customRoles: CustomRole[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // We use string here to handle 'OWNER', 'ADMIN', 'CASHIER', or 'custom:ROleid'
  const [roleSelection, setRoleSelection] = useState<string>('CASHIER')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const reload = () => window.location.reload()

  const startEdit = (u: User) => {
    setEditingId(u.id)
    setUsername(u.username)
    setRoleSelection(u.role === 'CUSTOM' && u.customRoleId ? `custom:${u.customRoleId}` : u.role)
    setPassword('') // Don't pre-fill password
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setUsername('')
    setRoleSelection('CASHIER')
    setPassword('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setPending(true); setError(null)
    const fd = new FormData()
    fd.set('username', username.trim())
    
    if (roleSelection.startsWith('custom:')) {
      fd.set('role', 'CUSTOM')
      fd.set('customRoleId', roleSelection.split('custom:')[1])
    } else {
      fd.set('role', roleSelection)
    }

    if (password) fd.set('password', password)

    const result = editingId
      ? await updateUser(editingId, fd)
      : await createUser(fd)

    if (!result.success) {
      setError(result.error || 'Failed.')
    } else {
      cancelEdit()
      reload()
    }
    setPending(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUserId) return alert('You cannot delete yourself.')
    if (!confirm(`Are you sure you want to delete user "${name}"?\nThis action cannot be undone.`)) return
    
    const res = await deleteUser(id)
    if (!res.success) {
      alert(res.error)
    } else {
      reload()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      {/* ── LEFT: Add/Edit Panel ── */}
      <div className="space-y-4">
        <div className={`card p-5 space-y-4 ${editingId ? 'border border-brand/40 bg-brand/[0.02]' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">{editingId ? 'Edit User' : 'Add New User'}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {editingId ? 'Update user details and roles.' : 'Create an account for a team member.'}
              </p>
            </div>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="field-label">Username</label>
              <input id="username" className="field-input text-sm" placeholder="e.g. jdoe_store1"
                value={username} onChange={e => setUsername(e.target.value)} required autoComplete="off" />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password {editingId && <span className="text-muted-foreground font-normal">(Leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} className="field-input text-sm pr-10" placeholder={editingId ? '••••••••' : 'Minimum 6 characters'}
                  value={password} onChange={e => setPassword(e.target.value)} required={!editingId} minLength={6} autoComplete="off" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-muted-foreground/80 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="field-label">System Role</label>
              <select id="role" className="field-input bg-background" value={roleSelection} onChange={e => setRoleSelection(e.target.value)}>
                <optgroup label="System Roles">
                  <option value="CASHIER">Cashier (POS Only)</option>
                  <option value="ADMIN">Admin (Manage data & users)</option>
                  <option value="OWNER">Owner (Full control)</option>
                </optgroup>
                {customRoles.length > 0 && (
                  <optgroup label="Custom Roles">
                    {customRoles.map(cr => (
                      <option key={cr.id} value={`custom:${cr.id}`}>{cr.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {error && <p className="field-error mt-1">{error}</p>}

            <button type="submit" disabled={pending} className={`btn-primary w-full flex items-center justify-center gap-1.5 mt-2 ${editingId ? 'bg-brand hover:bg-brand/90' : ''}`}>
               {pending ? 'Saving...' : editingId ? 'Update User' : <><PlusIcon /> Add User</>}
            </button>
          </form>
        </div>

        <div className="card p-4 bg-muted/10 border-border/50">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Role Permissions</h4>
          <ul className="text-[10px] text-muted-foreground space-y-1.5 list-disc pl-3">
            <li><strong>Cashier</strong>: Can only access Point of Sale.</li>
            <li><strong>Admin</strong>: Can manage products, categories, transactions, and cashiers.</li>
            <li><strong>Owner</strong>: Full system access including deleting/promoting admins.</li>
          </ul>
        </div>
      </div>

      {/* ── RIGHT: List of Users ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Directory</h2>
          <span className="badge badge-neutral">{users.length} members</span>
        </div>

        <div className="p-4 space-y-6 bg-card">
          {[
            { role: 'OWNER', label: 'Owner', type: 'system', users: users.filter(u => u.role === 'OWNER') },
            { role: 'ADMIN', label: 'Admin', type: 'system', users: users.filter(u => u.role === 'ADMIN') },
            { role: 'CASHIER', label: 'Cashier', type: 'system', users: users.filter(u => u.role === 'CASHIER') },
            ...customRoles.map(cr => ({
               role: `custom:${cr.id}`,
               label: cr.name,
               type: 'custom',
               users: users.filter(u => u.role === 'CUSTOM' && u.customRoleId === cr.id)
            }))
          ].filter(g => g.users.length > 0).map(group => (
            <div key={group.role} className="relative">
              {/* Role Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={
                  'shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ' +
                  (group.role === 'OWNER' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                   group.role === 'ADMIN' ? 'bg-brand/10 text-brand border border-brand/20' :
                   group.type === 'custom' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                   'bg-slate-500/10 text-slate-400 border border-slate-500/20')
                }>
                  {group.label}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">({group.users.length})</span>
              </div>

              {/* Users List for Role */}
              <div className="relative pl-5 space-y-3 before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-border/80">
                {group.users.map((u, i) => {
                  const isLast = i === group.users.length - 1;
                  return (
                    <div key={u.id} className="relative flex items-center gap-3 group">
                      {/* Tree branch line */}
                      <div className="absolute left-[-13px] top-1/2 w-[13px] h-px bg-border/80" />
                      {/* Mask vertical line below last item */}
                      {isLast && (
                        <div className="absolute left-[-14px] top-1/2 bottom-[-16px] w-[4px] bg-card z-10" />
                      )}

                      {/* Content Card */}
                      <div className={`flex-1 flex items-center justify-between p-2.5 rounded-md border transition-colors ${editingId === u.id ? 'bg-brand/5 border-brand/30 ring-1 ring-brand/20' : 'bg-background hover:bg-muted/20 border-border/60 hover:border-border'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-sm bg-muted text-muted-foreground font-bold uppercase ring-1 ring-border/50 shadow-xs">
                            {u.username.charAt(0)}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground truncate">{u.username}</span>
                              {u.id === currentUserId && (
                                <span className="badge badge-neutral text-[9px] px-1.5 py-0">You</span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Joined {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                          <button type="button" title="Edit" onClick={() => startEdit(u)}
                            className="flex shrink-0 h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                            <EditIcon />
                          </button>
                          {u.id !== currentUserId && (
                            <button type="button" title="Delete" onClick={() => handleDelete(u.id, u.username)}
                              className="flex shrink-0 h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
