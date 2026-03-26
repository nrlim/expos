'use client'

import React, { useState } from 'react'
import { createAttribute, deleteAttribute, createAttributeValue, deleteAttributeValue } from '@/app/actions/attribute'

interface AttributeValue {
  id: string
  value: string
  attributeId: string
}

interface Attribute {
  id: string
  name: string
  values: AttributeValue[]
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
const XIcon = () => (
  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

function AttributeCard({ attribute, onReload }: { attribute: Attribute, onReload: () => void }) {
  const [val, setVal] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!val.trim()) return
    setPending(true); setError(null)
    const fd = new FormData()
    fd.set('value', val.trim())
    const res = await createAttributeValue(attribute.id, fd)
    if (!res.success) {
      setError(res.error || 'Failed')
    } else {
      setVal('')
      onReload()
    }
    setPending(false)
  }

  const handleDeleteValue = async (id: string) => {
    setDeletingId(id)
    const res = await deleteAttributeValue(id)
    if (!res.success) {
      alert(res.error || 'Failed')
      setDeletingId(null)
    } else {
      onReload()
    }
  }

  const handleDeleteAttr = async () => {
    if (!confirm(`Delete attribute "${attribute.name}" and all its values?`)) return
    const res = await deleteAttribute(attribute.id)
    if (!res.success) {
      alert(res.error || 'Failed')
    } else {
      onReload()
    }
  }

  return (
    <div className="card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">{attribute.name}</h3>
        <button type="button" onClick={handleDeleteAttr} title="Delete Attribute" className="text-muted-foreground hover:text-destructive transition-colors">
          <TrashIcon />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {attribute.values.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">No values yet.</span>
          ) : (
            attribute.values.map(v => (
              <span key={v.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium border border-border/50">
                {v.value}
                <button type="button" onClick={() => handleDeleteValue(v.id)} disabled={deletingId === v.id} className="text-muted-foreground hover:text-destructive focus:outline-hidden">
                  {deletingId === v.id ? <span className="opacity-50">…</span> : <XIcon />}
                </button>
              </span>
            ))
          )}
        </div>

        <form onSubmit={handleAddValue} className="mt-auto pt-2 flex gap-2">
          <input
            type="text"
            className="flex-1 h-8 rounded-sm border border-border bg-background px-3 text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Add new value..."
            value={val}
            onChange={e => { setVal(e.target.value); setError(null) }}
          />
          <button type="submit" disabled={pending || !val.trim()} className="h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
            Add
          </button>
        </form>
        {error && <p className="text-[10px] text-destructive px-1">{error}</p>}
      </div>
    </div>
  )
}

export function AttributeManager({ attributes }: { attributes: Attribute[] }) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = () => window.location.reload()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setPending(true); setError(null)
    const fd = new FormData()
    fd.set('name', name.trim())
    const result = await createAttribute(fd)
    if (!result.success) {
      setError(result.error || 'Failed.')
    } else { 
      setName('')
      reload() 
    }
    setPending(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
      {/* ── LEFT: Add panel ── */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">New Attribute</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">e.g., Color, Size, Capacity.</p>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label htmlFor="name" className="field-label">Attribute Name</label>
              <input id="name" className="field-input" placeholder="e.g. Color"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
            </div>
            {error && <p className="field-error mt-1">{error}</p>}
            <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-1.5 mt-2">
              <PlusIcon />{pending ? 'Adding...' : 'Add Attribute'}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: Grid ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Attributes & Values</h2>
          <span className="badge badge-neutral">{attributes.length} attributes</span>
        </div>

        {attributes.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-foreground">No attributes defined.</p>
            <p className="text-xs text-muted-foreground mt-1">Create an attribute to manage its values.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributes.map(attr => (
              <AttributeCard key={attr.id} attribute={attr} onReload={reload} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
