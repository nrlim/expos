'use client'

import React, { useRef, useState } from 'react'
import { createCategory, deleteCategory, updateCategory, uploadCategoryImage } from '@/app/actions/category'

interface SubCategory {
  id: string
  name: string
  imageUrl?: string | null
  _count: { products: number }
}

interface Category {
  id: string
  name: string
  imageUrl?: string | null
  _count: { products: number }
  children: SubCategory[]
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
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

// ─── CategoryAvatar — clickable icon to upload image ─────────────────────────
function CategoryAvatar({ id, imageUrl, name, size = 'md' }: {
  id: string
  imageUrl?: string | null
  name: string
  size?: 'sm' | 'md'
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dim = size === 'sm' ? 'w-7 h-7 text-[9px]' : 'w-8 h-8 text-[10px]'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)

    // Instant local preview
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const fd = new FormData()
    fd.set('image', file)
    const result = await uploadCategoryImage(id, fd)

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
        className={`${dim} rounded-md overflow-hidden border-2 border-border bg-muted flex items-center justify-center hover:border-primary transition-all focus:outline-none relative`}
      >
        {preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-muted-foreground uppercase">{name.charAt(0)}</span>
        )}

        {/* Hover overlay */}
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
    const result = await updateCategory(id, value.trim())
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

// ─── CategoryManager ──────────────────────────────────────────────────────────
export function CategoryManager({ categories: initialCategories }: { categories: Category[] }) {
  const allIds = initialCategories.map(c => c.id)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(allIds)) // start expanded
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)

  const [rootName, setRootName] = useState('')
  const [rootPending, setRootPending] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)

  const [subName, setSubName] = useState('')
  const [subPending, setSubPending] = useState(false)
  const [subError, setSubError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const reload = () => window.location.reload()

  const toggleExpand = (id: string) =>
    setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const expandAll = () => setExpandedIds(new Set(allIds))
  const collapseAll = () => setExpandedIds(new Set())

  const handleAddRoot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rootName.trim()) return
    setRootPending(true); setRootError(null)
    const fd = new FormData(); fd.set('name', rootName.trim())
    const result = await createCategory(fd)
    if (!result.success) setRootError(result.error || 'Failed.'); else { setRootName(''); reload() }
    setRootPending(false)
  }

  const handleAddSub = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!subName.trim()) return
    setSubPending(true); setSubError(null)
    const fd = new FormData(); fd.set('name', subName.trim()); fd.set('parentId', parentId)
    const result = await createCategory(fd)
    if (!result.success) setSubError(result.error || 'Failed.'); else { setSubName(''); setAddingSubFor(null); reload() }
    setSubPending(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Sub-categories will also be removed. Products become uncategorized.`)) return
    setDeletingId(id)
    await deleteCategory(id)
    reload()
  }

  const totalSubs = initialCategories.reduce((acc, c) => acc + c.children.length, 0)
  const allExpanded = expandedIds.size === allIds.length && allIds.length > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

      {/* ── LEFT: Add panel ── */}
      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Add Root Category</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Top-level groupings, e.g. "Smartphones".</p>
          </div>
          <form onSubmit={handleAddRoot} className="space-y-3">
            <div>
              <label htmlFor="root-name" className="field-label">Category Name</label>
              <input id="root-name" className="field-input" placeholder="e.g. Smartphones"
                value={rootName} onChange={e => setRootName(e.target.value)} required autoComplete="off" />
              {rootError && <p className="field-error mt-1">{rootError}</p>}
            </div>
            <button type="submit" disabled={rootPending} className="btn-primary w-full flex items-center justify-center gap-1.5">
              <PlusIcon />{rootPending ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <p className="stat-label">Categories</p>
            <p className="stat-value">{initialCategories.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Sub-Categories</p>
            <p className="stat-value">{totalSubs}</p>
          </div>
        </div>

        <div className="rounded-sm border border-border/60 bg-muted/10 px-4 py-3 text-[11px] text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground">Quick tips</p>
          <p>— Click the <span className="font-bold text-primary">avatar</span> icon on any row to upload a category image.</p>
          <p>— Click the <span className="font-bold text-primary">pencil</span> or double-click a name to rename inline.</p>
          <p>— Press <kbd className="px-1 rounded border border-border bg-muted">Enter</kbd> to save or <kbd className="px-1 rounded border border-border bg-muted">Esc</kbd> to cancel.</p>
          <p>— Use <span className="font-bold">Expand / Collapse All</span> in the tree header to navigate faster.</p>
        </div>
      </div>

      {/* ── RIGHT: Category Tree ── */}
      <div className="card overflow-hidden">
        {/* Tree header with expand/collapse buttons */}
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex-1">Category Tree</h2>
          <span className="badge badge-neutral">{initialCategories.length + totalSubs} total</span>
          {initialCategories.length > 0 && (
            <>
              <div className="w-px h-4 bg-border" />
              <button
                type="button"
                onClick={expandAll}
                disabled={allExpanded}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                disabled={expandedIds.size === 0}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Collapse All
              </button>
            </>
          )}
        </div>

        {initialCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-10 h-10 mb-3 text-muted-foreground/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p className="text-sm font-semibold text-foreground">No categories yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a root category on the left to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {initialCategories.map((cat) => {
              const isExpanded = expandedIds.has(cat.id)
              const isAddingSub = addingSubFor === cat.id

              return (
                <li key={cat.id}>
                  {/* ── ROOT ROW ── */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors group ${isExpanded ? 'bg-muted/20' : 'hover:bg-muted/20'}`}>
                    {/* Chevron */}
                    <button type="button" onClick={() => toggleExpand(cat.id)}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-sm hover:bg-accent transition-colors">
                      <ChevronIcon open={isExpanded} />
                    </button>

                    {/* Category Avatar */}
                    <CategoryAvatar id={cat.id} imageUrl={cat.imageUrl} name={cat.name} size="md" />

                    {/* Inline editable name */}
                    <InlineEdit id={cat.id} initialName={cat.name} onSaved={reload} />

                    {/* Badges */}
                    {cat.children.length > 0 && (
                      <span className="badge badge-neutral shrink-0 text-[9px]">{cat.children.length} sub</span>
                    )}
                    {cat._count.products > 0 && (
                      <span className="badge badge-brand shrink-0 text-[9px]">{cat._count.products} items</span>
                    )}

                    {/* Hover actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button type="button" title="Add sub-category"
                        onClick={() => {
                          setAddingSubFor(isAddingSub ? null : cat.id)
                          setSubName(''); setSubError(null)
                          if (!isExpanded) toggleExpand(cat.id)
                        }}
                        className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">
                        <PlusIcon /> Sub
                      </button>
                      <button type="button" title="Delete" onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                        {deletingId === cat.id ? '…' : <TrashIcon />}
                      </button>
                    </div>
                  </div>

                  {/* ── EXPANDED: children + add-sub form ── */}
                  {isExpanded && (
                    <div className="border-t border-border/40 bg-muted/5">
                      {isAddingSub && (
                        <form onSubmit={e => handleAddSub(e, cat.id)}
                          className="flex items-end gap-2 px-12 py-2.5 border-b border-dashed border-border/60 bg-accent/20">
                          <div className="flex-1">
                            <label className="field-label text-[10px]">
                              New sub-category under <span className="text-accent-foreground font-bold">{cat.name}</span>
                            </label>
                            <input className="field-input h-7 text-xs" placeholder="e.g. iPhone Series"
                              value={subName} onChange={e => setSubName(e.target.value)}
                              required autoFocus autoComplete="off" />
                            {subError && <p className="field-error mt-0.5">{subError}</p>}
                          </div>
                          <button type="submit" disabled={subPending} className="btn-primary h-7 px-4 text-[10px] shrink-0">
                            {subPending ? '…' : 'Add'}
                          </button>
                          <button type="button" onClick={() => { setAddingSubFor(null); setSubError(null) }}
                            className="btn-ghost h-7 px-3 text-[10px] shrink-0">Cancel</button>
                        </form>
                      )}

                      {cat.children.length > 0 ? (
                        <ul>
                          {cat.children.map(sub => (
                            <li key={sub.id}
                              className="flex items-center gap-2.5 pl-11 pr-4 py-2 hover:bg-muted/30 transition-colors group border-b border-border/30 last:border-0">
                              {/* Tree connector */}
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <span className="w-3 h-px bg-border/60" />
                              </span>

                              {/* Sub-category Avatar */}
                              <CategoryAvatar id={sub.id} imageUrl={sub.imageUrl} name={sub.name} size="sm" />

                              {/* Inline editable name */}
                              <InlineEdit id={sub.id} initialName={sub.name} onSaved={reload} />

                              {sub._count.products > 0 && (
                                <span className="badge badge-brand shrink-0 text-[9px]">{sub._count.products} items</span>
                              )}

                              <button type="button" onClick={() => handleDelete(sub.id, sub.name)}
                                disabled={deletingId === sub.id} title="Delete sub-category"
                                className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 shrink-0">
                                {deletingId === sub.id ? '…' : <><TrashIcon /> Remove</>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : !isAddingSub && (
                        <p className="pl-12 pr-4 py-3 text-xs text-muted-foreground italic">
                          No sub-categories. Hover the root row and click "+ Sub" to add one.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
