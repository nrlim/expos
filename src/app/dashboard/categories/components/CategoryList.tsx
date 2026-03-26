'use client'

import React, { useRef, useState } from 'react'
import { createCategory, deleteCategory } from '@/app/actions/category'

interface Category {
  id: string
  name: string
  createdAt: Date
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createCategory(formData)
    
    if (result && !result.success) {
      setError(result.error || 'Failed to save category.')
    } else {
      formRef.current?.reset()
    }
    
    setIsPending(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Associated products will simply become uncategorized.')) {
      return
    }

    setDeletingId(id)
    setError(null)
    const result = await deleteCategory(id)
    
    if (result && !result.success) {
      setError(result.error || 'Failed to delete category.')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert-error mb-4">
          <div className="flex flex-col">
            <span className="font-bold">Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* CREATE FORM */}
      <form ref={formRef} onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end p-4 border border-border/60 bg-muted/10 rounded-sm">
        <div className="flex-1 w-full relative">
          <label htmlFor="name" className="field-label px-1">New Category Name</label>
          <input 
            id="name" 
            name="name" 
            autoComplete="off"
            className="field-input w-full" 
            placeholder="e.g. Vintage Electronics" 
            required 
          />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto px-6 h-8 shrink-0" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {/* CATEGORY LIST */}
      <div>
        <h3 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Existing Categories ({categories.length})</h3>
        
        {categories.length === 0 ? (
          <div className="text-center py-8 bg-background border border-dashed border-border/60 rounded-sm">
            <p className="text-sm font-medium text-slate-400">No categories added yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Start by adding a category above.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between p-3 border border-border/80 rounded-sm bg-background hover:bg-muted/30 transition-colors">
                <span className="text-sm font-semibold text-foreground tracking-tight">{c.name}</span>
                <button 
                  type="button" 
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="btn-danger w-auto px-3 py-1 text-[10px] h-6 flex items-center justify-center shrink-0"
                >
                  {deletingId === c.id ? '...' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
