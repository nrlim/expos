'use client'

import React, { useState } from 'react'
import { createWarranty, deleteWarranty } from '@/app/actions/warranty'

interface Warranty {
  id: string
  name: string
  duration: number
  durationUnit: string
  description?: string | null
  _count: { products: number }
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

export function WarrantyManager({ warranties }: { warranties: Warranty[] }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [durationUnit, setDurationUnit] = useState('Months')
  const [description, setDescription] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const reload = () => window.location.reload()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !duration) return
    setPending(true); setError(null)
    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('duration', duration)
    fd.set('durationUnit', durationUnit)
    fd.set('description', description.trim())
    const result = await createWarranty(fd)
    if (!result.success) {
      setError(result.error || 'Failed.')
    } else { 
      setName('')
      setDuration('')
      setDescription('')
      reload() 
    }
    setPending(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete warranty "${name}"?`)) return
    setDeletingId(id)
    const res = await deleteWarranty(id)
    if (!res.success) {
      alert(res.error)
      setDeletingId(null)
    } else {
      reload()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      {/* ── LEFT: Add panel ── */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Add Warranty</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">e.g., Garansi Resmi 1 Tahun.</p>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label htmlFor="name" className="field-label">Warranty Name</label>
              <input id="name" className="field-input" placeholder="e.g. Garansi iBox"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="duration" className="field-label">Duration</label>
                <input id="duration" type="number" min="0" className="field-input" placeholder="e.g. 1"
                  value={duration} onChange={e => setDuration(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="durationUnit" className="field-label">Unit</label>
                <select id="durationUnit" className="field-input" value={durationUnit} onChange={e => setDurationUnit(e.target.value)}>
                  <option value="Days">Days</option>
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="field-label">Description (Optional)</label>
              <textarea id="description" className="field-input h-16 py-1.5 resize-none" placeholder="Details about this warranty..."
                value={description} onChange={e => setDescription(e.target.value)} autoComplete="off" />
            </div>

            {error && <p className="field-error mt-1">{error}</p>}
            <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-1.5 mt-2">
              <PlusIcon />{pending ? 'Adding...' : 'Add Warranty'}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: List ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Warranties List</h2>
          <span className="badge badge-neutral">{warranties.length} total</span>
        </div>

        {warranties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-foreground">No warranties yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a warranty on the left to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {warranties.map((warr) => (
              <li key={warr.id}>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-semibold text-foreground truncate">{warr.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {warr.duration} {warr.durationUnit}
                      {warr.description && <span className="ml-2 pl-2 border-l border-border italic">{warr.description}</span>}
                    </span>
                  </div>

                  {warr._count.products > 0 && (
                    <span className="badge badge-brand shrink-0 text-[10px] px-2.5" title="Active Products">
                      {warr._count.products} products
                    </span>
                  )}

                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button type="button" title="Delete" onClick={() => handleDelete(warr.id, warr.name)}
                      disabled={deletingId === warr.id}
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      {deletingId === warr.id ? '…' : <><TrashIcon /> Remove</>}
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
