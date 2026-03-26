'use client'

import React, { useRef, useState } from 'react'
import { createBrand, deleteBrand, updateBrand, uploadBrandImage } from '@/app/actions/brand'

interface Brand {
  id: string
  name: string
  imageUrl?: string | null
  _count: { products: number }
}

const PlusIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
)
const PencilIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)
const TrashIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)
const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const ImageIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

// ─── BrandAvatar — clickable icon to upload image ─────────────────────────────
function BrandAvatar({ id, imageUrl, name }: { id: string, imageUrl?: string | null, name: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)

    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const fd = new FormData()
    fd.set('image', file)
    const result = await uploadBrandImage(id, fd)

    if (!result.success) {
      setError(result.error ?? 'Upload failed.')
      setPreview(imageUrl ?? null)
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <span className="relative flex-shrink-0 group/avatar" title={error ?? 'Click to upload icon'}>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-8 h-8 rounded-md overflow-hidden border-2 border-border bg-muted flex items-center justify-center hover:border-primary transition-all focus:outline-none relative"
      >
        {preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-muted-foreground uppercase text-[10px]">{name.charAt(0)}</span>
        )}
        <span className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
          {uploading
            ? <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
            : <ImageIcon />
          }
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && (
        <span className="absolute top-full left-0 mt-1 z-50 whitespace-nowrap rounded-sm bg-destructive px-2 py-0.5 text-[10px] text-white shadow-md">
          {error}
        </span>
      )}
    </span>
  )
}

// ─── InlineEdit ───────────────────────────────────────────────────────────────
function InlineEdit({ id, initialName, onSaved }: { id: string; initialName: string; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const start = () => { setEditing(true); setValue(initialName); setError(null); setTimeout(() => inputRef.current?.select(), 0) }
  const cancel = () => { setEditing(false); setValue(initialName); setError(null) }

  const save = async () => {
    if (value.trim() === initialName) { cancel(); return }
    if (!value.trim()) { setError('Cannot be empty.'); return }
    setSaving(true); setError(null)
    const result = await updateBrand(id, value.trim())
    setSaving(false)
    if (!result.success) setError(result.error || 'Failed.')
    else { setEditing(false); onSaved() }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <span className="flex items-center gap-1.5 flex-1 min-w-0">
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={e => { setValue(e.target.value); setError(null) }}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="h-6 flex-1 min-w-0 rounded-sm border border-primary bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button type="button" onClick={save} disabled={saving} title="Save (Enter)"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-sm bg-success/20 text-success hover:bg-success/30 transition-colors">
          {saving ? <span className="text-[9px]">…</span> : <CheckIcon />}
        </button>
        <button type="button" onClick={cancel} disabled={saving} title="Cancel (Esc)"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
          <XIcon />
        </button>
        {error && <span className="text-[10px] text-destructive shrink-0">{error}</span>}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 flex-1 min-w-0 group/label cursor-default" onDoubleClick={start} title="Double-click to rename">
      <span className="text-sm font-semibold text-foreground truncate">{initialName}</span>
      <button type="button" onClick={start} title="Rename"
        className="opacity-0 group-hover/label:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-sm text-muted-foreground hover:text-primary hover:bg-accent transition-all">
        <PencilIcon />
      </button>
    </span>
  )
}

// ─── BrandManager ─────────────────────────────────────────────────────────────
export function BrandManager({ brands: initialBrands }: { brands: Brand[] }) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const reload = () => window.location.reload()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setPending(true); setError(null)
    const fd = new FormData(); fd.set('name', name.trim())
    const result = await createBrand(fd)
    if (!result.success) setError(result.error || 'Failed.'); else { setName(''); reload() }
    setPending(false)
  }

  const handleDelete = async (id: string, brandName: string) => {
    if (!confirm(`Delete "${brandName}"? Products mapped to this brand will lose their brand association.`)) return
    setDeletingId(id)
    await deleteBrand(id)
    reload()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

      {/* ── LEFT: Add panel ── */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Add Brand</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">e.g., Apple, Samsung, Lenovo.</p>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label htmlFor="name" className="field-label">Brand Name</label>
              <input id="name" className="field-input" placeholder="e.g. Apple"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
              {error && <p className="field-error mt-1">{error}</p>}
            </div>
            <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-1.5">
              <PlusIcon />{pending ? 'Adding...' : 'Add Brand'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="stat-card">
            <p className="stat-label">Total Brands</p>
            <p className="stat-value">{initialBrands.length}</p>
          </div>
        </div>

        <div className="rounded-sm border border-border/60 bg-muted/10 px-4 py-3 text-[11px] text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground">Quick tips</p>
          <p>— Click the <span className="font-bold text-primary">avatar</span> icon on any row to upload a brand logo.</p>
          <p>— Click the <span className="font-bold text-primary">pencil</span> or double-click a name to rename inline.</p>
          <p>— Press <kbd className="px-1 rounded border border-border bg-muted">Enter</kbd> to save or <kbd className="px-1 rounded border border-border bg-muted">Esc</kbd> to cancel.</p>
        </div>
      </div>

      {/* ── RIGHT: Brand List ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brands List</h2>
          <span className="badge badge-neutral">{initialBrands.length} total</span>
        </div>

        {initialBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-10 h-10 mb-3 text-muted-foreground/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-semibold text-foreground">No brands yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a brand on the left to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {initialBrands.map((brand) => (
              <li key={brand.id}>
                <div className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/20 transition-colors group">
                  
                  {/* Brand Avatar / Icon upload */}
                  <BrandAvatar id={brand.id} imageUrl={brand.imageUrl} name={brand.name} />

                  {/* Inline editable name */}
                  <InlineEdit id={brand.id} initialName={brand.name} onSaved={reload} />

                  {/* Badges */}
                  {brand._count.products > 0 && (
                    <span className="badge badge-brand shrink-0 text-[10px] px-2.5">{brand._count.products} products</span>
                  )}

                  {/* Hover actions */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                    <button type="button" title="Delete" onClick={() => handleDelete(brand.id, brand.name)}
                      disabled={deletingId === brand.id}
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      {deletingId === brand.id ? '…' : <><TrashIcon /> Remove</>}
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
