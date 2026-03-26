'use client'

import React, { useState } from 'react'
import { createCustomRole, updateCustomRole, deleteCustomRole } from '@/app/actions/role'

interface CustomRole {
  id: string
  name: string
  parsedPermissions: string[]
  _count: { users: number }
}

interface PermissionDef {
  id: string
  label: string
}

interface Props {
  customRoles: CustomRole[]
  permissionsList: PermissionDef[]
}

export function RoleManager({ customRoles, permissionsList }: Props) {
  const [activeRole, setActiveRole] = useState<CustomRole | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const resetForm = () => {
    setActiveRole(null)
    setIsCreating(false)
    setName('')
    setSelectedPerms(new Set())
    setError(null)
  }

  const handleEdit = (role: CustomRole) => {
    resetForm()
    setActiveRole(role)
    setName(role.name)
    setSelectedPerms(new Set(role.parsedPermissions))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setPending(true)
    setError(null)

    const permsJson = JSON.stringify(Array.from(selectedPerms))

    if (isCreating) {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('permissions', permsJson)
      const res = await createCustomRole(fd)
      if (!res.success) setError(res.error || 'Failed to create role')
      else resetForm()
    } else if (activeRole) {
      const res = await updateCustomRole(activeRole.id, name.trim(), permsJson)
      if (!res.success) setError(res.error || 'Failed to update role')
      else resetForm()
    }
    setPending(false)
  }

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Delete role "${roleName}"? Users with this role will fall back to Cashier access.`)) return
    setDeletingId(id)
    const res = await deleteCustomRole(id)
    if (!res.success) alert(res.error || 'Failed to delete role')
    setDeletingId(null)
  }

  const togglePerm = (permId: string) => {
    const newSet = new Set(selectedPerms)
    if (newSet.has(permId)) newSet.delete(permId)
    else newSet.add(permId)
    setSelectedPerms(newSet)
  }

  const selectAllPerms = () => {
    setSelectedPerms(new Set(permissionsList.map(p => p.id)))
  }

  const clearAllPerms = () => {
    setSelectedPerms(new Set())
  }

  const isFormOpen = isCreating || activeRole !== null

  return (
    <div className="w-full">
      {!isFormOpen ? (
        <div className="space-y-8 animate-fade-in">
          {/* Custom Roles List */}
          <div className="card overflow-hidden w-full">
            <div className="px-5 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Custom Roles</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Roles mapped to specific permissions.</p>
              </div>
              <button onClick={() => setIsCreating(true)} className="btn-primary py-2 px-4 text-xs font-bold shadow-sm">
                + Create Custom Role
              </button>
            </div>

            {customRoles.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-bold text-foreground text-base">No Custom Roles</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                  Build flexible roles based on precise permissions for your team.
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Users Assigned</th>
                    <th>Permissions Granted</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customRoles.map(r => (
                    <tr key={r.id} className="hover:bg-muted/10 group transition-colors">
                      <td className="font-bold text-foreground py-4">
                        {r.name}
                      </td>
                      <td className="py-4">
                        <span className="badge badge-neutral text-xs">{r._count.users} users</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-muted-foreground font-semibold px-2 py-1 bg-muted/40 rounded-sm">
                          {r.parsedPermissions.length} modules
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(r)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                          <span className="text-border">|</span>
                          <button 
                            onClick={() => handleDelete(r.id, r.name)}
                            disabled={deletingId === r.id}
                            className="text-xs font-bold text-destructive hover:underline"
                          >
                            {deletingId === r.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* System Roles (Read Only) */}
          <div className="card overflow-hidden w-full">
            <div className="px-5 py-4 border-b border-border bg-muted/10">
               <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">System Roles</h2>
               <p className="text-xs text-muted-foreground mt-0.5">Fixed default roles required by the system engine.</p>
            </div>
            <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-1/3">Role</th>
                    <th>Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="font-bold text-foreground py-3">OWNER <span className="ml-2 badge badge-neutral text-[9px]">Root</span></td>
                        <td className="text-muted-foreground text-sm py-3">Full system access, billing, and system deletion. Cannot be removed.</td>
                    </tr>
                    <tr>
                        <td className="font-bold text-foreground py-3">ADMIN <span className="ml-2 badge badge-neutral text-[9px]">System</span></td>
                        <td className="text-muted-foreground text-sm py-3">Broad operational access including inventory, products, catalogs, and overview analytics.</td>
                    </tr>
                    <tr>
                        <td className="font-bold text-foreground py-3">CASHIER <span className="ml-2 badge badge-neutral text-[9px]">System</span></td>
                        <td className="text-muted-foreground text-sm py-3">Access strictly limited to Point of Sale (POS) checkout in their assigned store.</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 animate-slide-up relative z-10 w-full shadow-xs">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <button onClick={resetForm} className="h-7 w-7 flex items-center justify-center rounded-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
            </button>
            <h2 className="text-sm font-bold text-foreground">
              {isCreating ? 'Create Custom Role' : 'Edit Role'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="max-w-xl">
              <label className="field-label">Role Name</label>
              <input 
                type="text" 
                className="field-input w-full" 
                placeholder="e.g. Regional Manager, Returns Specialist..." 
                required 
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Display name for this role, used when assigning roles to users.</p>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Module Access Control</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    Select exactly which areas of the dashboard users with this role can view and modify.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" onClick={selectAllPerms} className="btn-secondary h-8 text-[11px] px-3">Select All</button>
                  <button type="button" onClick={clearAllPerms} className="btn-ghost h-8 text-[11px] px-3 font-semibold text-muted-foreground">Clear All</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissionsList.map(perm => {
                  const isChecked = selectedPerms.has(perm.id)
                  return (
                    <label key={perm.id} className={`group relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' : 'bg-card border-border hover:border-primary/40 hover:bg-muted/10'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={isChecked}
                        onChange={() => togglePerm(perm.id)}
                      />
                      <div className="pt-0.5 flex-shrink-0">
                         <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-primary border-primary' : 'bg-background border-border/80 group-hover:border-primary/50'}`}>
                           {isChecked && (
                             <svg className="w-3.5 h-3.5 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           )}
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-xs font-semibold transition-colors ${isChecked ? 'text-primary' : 'text-foreground'}`}>{perm.label}</span>
                        <span className="block text-[10px] text-muted-foreground mt-0.5 capitalize">{perm.id.replace('module:', '')} module</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="border-t border-border pt-5 flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
              <button disabled={pending} type="submit" className="btn-primary min-w-[120px] shadow-sm">
                {pending ? 'Saving...' : 'Save Role Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
