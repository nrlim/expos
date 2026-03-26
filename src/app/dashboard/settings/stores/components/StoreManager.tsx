'use client'

import React, { useState } from 'react'
import { createStore, updateStore, deleteStore } from '@/app/actions/store'

interface Store {
  id: string
  name: string
  location: string | null
  _count: {
    inventories: number
    transactions: number
  }
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
const StoreIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

export function StoreManager({ stores }: { stores: Store[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = () => window.location.reload()

  const startEdit = (s: Store) => {
    setEditingId(s.id)
    setName(s.name)
    setLocation(s.location || '')
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setLocation('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setPending(true); setError(null)
    const fd = new FormData()
    fd.set('name', name.trim())
    if (location.trim()) fd.set('location', location.trim())

    const result = editingId
      ? await updateStore(editingId, fd)
      : await createStore(fd)

    if (!result.success) {
      setError(result.error || 'Failed to save store.')
    } else {
      cancelEdit()
      reload()
    }
    setPending(false)
  }

  const handleDelete = async (id: string, storeName: string) => {
    if (!confirm(`Are you sure you want to delete the store "${storeName}"?\nThis might fail if it has active transactions.`)) return
    const res = await deleteStore(id)
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
              <h2 className="text-sm font-bold text-foreground">{editingId ? 'Edit Store' : 'Add New Store'}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {editingId ? 'Change branch details.' : 'Create a new physical or virtual branch.'}
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
              <label htmlFor="name" className="field-label">Store Name <span className="text-destructive">*</span></label>
              <input id="name" className="field-input text-sm" placeholder="e.g. Toko Cabang Sudirman"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
            </div>

            <div>
              <label htmlFor="location" className="field-label">Location / Address</label>
              <textarea id="location" rows={3} className="field-input text-sm resize-y" placeholder="Optional. Full address or city map link."
                value={location} onChange={e => setLocation(e.target.value)} />
            </div>

            {error && <p className="field-error mt-1">{error}</p>}

            <button type="submit" disabled={pending} className={`btn-primary w-full flex items-center justify-center gap-1.5 mt-2 ${editingId ? 'bg-brand hover:bg-brand/90' : ''}`}>
               {pending ? 'Saving...' : editingId ? 'Update Store' : <><PlusIcon /> Add Store</>}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: List of Stores ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Locations</h2>
          <span className="badge badge-neutral">{stores.length} stores</span>
        </div>

        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <StoreIcon />
            <p className="text-sm font-semibold mt-3 text-foreground">No stores configured.</p>
            <p className="text-xs mt-1">Add a store on the left to start managing inventory.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {stores.map((s) => (
              <li key={s.id} className={editingId === s.id ? 'bg-brand/5' : ''}>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/10 transition-colors group">
                  {/* Icon */}
                  <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-md bg-stone-500/10 text-stone-500 font-bold ring-1 ring-stone-500/20 shadow-sm">
                    <StoreIcon />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-bold text-foreground truncate">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[80%] truncate">
                      {s.location || 'No address provided'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="shrink-0 flex items-center gap-2">
                    {s._count.inventories > 0 && (
                      <span className="text-[10px] font-semibold text-muted-foreground badge badge-neutral py-0 px-1.5">
                        {s._count.inventories} SKUs
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button type="button" title="Edit" onClick={() => startEdit(s)}
                      className="flex shrink-0 h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                      <EditIcon />
                    </button>
                    <button type="button" title="Delete" onClick={() => handleDelete(s.id, s.name)}
                      className="flex shrink-0 h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
