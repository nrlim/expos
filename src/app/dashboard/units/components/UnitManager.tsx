'use client'

import React, { useState } from 'react'
import { createUnit, deleteUnit, updateUnit } from '@/app/actions/unit'

interface Unit {
  id: string
  name: string
  shortName: string
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

export function UnitManager({ units }: { units: Unit[] }) {
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const reload = () => window.location.reload()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !shortName.trim()) return
    setPending(true); setError(null)
    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('shortName', shortName.trim())
    const result = await createUnit(fd)
    if (!result.success) {
      setError(result.error || 'Failed.')
    } else { 
      setName('')
      setShortName('')
      reload() 
    }
    setPending(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete unit "${name}"?`)) return
    setDeletingId(id)
    const res = await deleteUnit(id)
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
            <h2 className="text-sm font-bold text-foreground">Add Unit</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">e.g., Box, Kilogram, Pieces.</p>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label htmlFor="name" className="field-label">Unit Full Name</label>
              <input id="name" className="field-input" placeholder="e.g. Pieces"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
            </div>
            <div>
              <label htmlFor="shortName" className="field-label">Abbreviation / Short Name</label>
              <input id="shortName" className="field-input" placeholder="e.g. Pcs"
                value={shortName} onChange={e => setShortName(e.target.value)} required autoComplete="off" />
            </div>
            {error && <p className="field-error mt-1">{error}</p>}
            <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-1.5 mt-2">
              <PlusIcon />{pending ? 'Adding...' : 'Add Unit'}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: List ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Units List</h2>
          <span className="badge badge-neutral">{units.length} total</span>
        </div>

        {units.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-foreground">No units yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a unit on the left to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {units.map((unit) => (
              <li key={unit.id}>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-semibold text-foreground truncate">{unit.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{unit.shortName}</span>
                  </div>

                  {unit._count.products > 0 && (
                    <span className="badge badge-brand shrink-0 text-[10px] px-2.5" title="Active Products">
                      {unit._count.products} products
                    </span>
                  )}

                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button type="button" title="Delete" onClick={() => handleDelete(unit.id, unit.name)}
                      disabled={deletingId === unit.id}
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      {deletingId === unit.id ? '…' : <><TrashIcon /> Remove</>}
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
