'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { deleteProduct } from '@/app/actions/product'
import { ResponsiveTable, type Column } from '@/components/dashboard/ResponsiveTable'

interface Product {
  id: string
  name: string
  brand: string
  storage: string | null
  price: number
  condition: string
  stockStatus: string
  stock: number
  imageUrl: string | null
  displayStock?: number
  displayPrice?: number
  category: { id: string; name: string } | null
  inventories?: { storeId: string; stock: number; price: number | null }[]
}

interface ProductTableProps {
  products: Product[]
  categories: { id: string; name: string }[]
}

function statusBadge(status: string) {
  if (status === 'AVAILABLE') return <span className="badge badge-success">Available</span>
  if (status === 'BOOKED')    return <span className="badge badge-warning">Booked</span>
  return <span className="badge badge-neutral">Sold</span>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [activeStore, setActiveStore] = useState<string>('ALL')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Listen to LocalStorage mutations from TopBar (Polling or event)
  React.useEffect(() => {
    const checkStore = () => {
      const savedStore = localStorage.getItem('expos_active_store') || 'ALL'
      if (savedStore !== activeStore) setActiveStore(savedStore)
    }
    checkStore()
    const interval = setInterval(checkStore, 1000)
    return () => clearInterval(interval)
  }, [activeStore])

  // Derived state
  const computedProducts = useMemo(() => {
    return products.map(p => {
      if (activeStore === 'ALL') return { ...p, displayStock: p.stock, displayPrice: p.price }
      const storeInv = p.inventories?.find(i => i.storeId === activeStore)
      const specificStock = storeInv?.stock || 0
      const specificPrice = storeInv?.price || p.price
      return { ...p, displayStock: specificStock, displayPrice: specificPrice }
    })
  }, [products, activeStore])

  const filteredProducts = useMemo(() => {
    return computedProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.brand.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter ? p.category?.id === categoryFilter : true
      return matchesSearch && matchesCategory
    })
  }, [computedProducts, search, categoryFilter])

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const toggleOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} product(s)?`)) return
    try {
      const results = await Promise.all(ids.map(id => deleteProduct(id)))
      const failed = results.filter(r => !r.success)
      if (failed.length > 0) {
        alert('Some products could not be deleted.')
      } else {
        setSelectedIds(new Set())
      }
    } catch {
      alert('An error occurred during deletion.')
    }
  }

  // Column definitions
  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: 'Image',
      mobileHidden: true,
      render: (p) =>
        p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-sm object-cover bg-muted" />
        ) : (
          <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-[8px] text-muted-foreground">No img</div>
        ),
    },
    {
      key: 'name',
      header: 'Name',
      cardPrimary: true,
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{p.name}</span>
          <span className="text-[10px] text-muted-foreground">{p.brand}{p.storage ? ` • ${p.storage}` : ''}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cardSecondary: true,
      render: (p) => (
        <span className="text-muted-foreground">{p.category?.name || '—'}</span>
      ),
    },
    {
      key: 'displayPrice',
      header: 'Price',
      render: (p) => (
        <span className="font-medium text-foreground">{formatCurrency(p.displayPrice ?? p.price)}</span>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      mobileHidden: true,
      render: (p) => <span className="text-muted-foreground">{p.condition}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => statusBadge((p.displayStock ?? p.stock) > 0 ? 'AVAILABLE' : 'SOLD'),
    },
    {
      key: 'displayStock',
      header: 'Stock',
      align: 'center',
      render: (p) => {
        const st = p.displayStock ?? p.stock
        return (
          <span className={`font-semibold ${st <= 2 && st > 0 ? 'text-warning' : st === 0 ? 'text-destructive' : 'text-success'}`}>
            {st}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-3">
      {/* ─── FILTER & ACTION BAR ─── */}
      <div className="flex flex-col gap-3">
        {/* Top row: search + add button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              className="field-input w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter toggle button — mobile only */}
          <button
            className="sm:hidden flex h-8 items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
            onClick={() => setFiltersOpen(!filtersOpen)}
            id="btn-toggle-filters"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Filter
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedIds.size > 0 && (
              <button
                className="btn-danger"
                onClick={() => handleDelete(Array.from(selectedIds))}
                id="btn-bulk-delete"
              >
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">({selectedIds.size})</span>
              </button>
            )}
            <Link href="/dashboard/products/new" className="btn-primary whitespace-nowrap" id="btn-add-product">
              + <span className="hidden xs:inline">Add</span> Product
            </Link>
          </div>
        </div>

        {/* Collapsible filters row — always visible on sm+, toggleable on mobile */}
        <div className={`${filtersOpen ? 'flex' : 'hidden sm:flex'} items-center gap-2 flex-wrap`}>
          <select
            className="field-input h-8 min-w-[140px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="filter-category"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedIds.size > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
        </div>
      </div>

      {/* ─── RESPONSIVE TABLE ─── */}
      <ResponsiveTable<Product>
        columns={columns}
        data={filteredProducts}
        selectedIds={selectedIds}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        renderActions={(p) => (
          <div className="flex items-center justify-end gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <Link href={`/dashboard/products/${p.id}/edit`} className="text-[10px] hover:underline font-semibold hover:text-primary">
              Edit
            </Link>
            <button type="button" className="text-[10px] hover:underline font-semibold hover:text-primary text-muted-foreground">
              Duplicate
            </button>
          </div>
        )}
        renderCard={(p) => (
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              className="accent-primary cursor-pointer w-4 h-4 mt-0.5 shrink-0"
              checked={selectedIds.has(p.id)}
              onChange={() => toggleOne(p.id)}
            />

            {/* Thumbnail */}
            <div className="h-12 w-12 shrink-0 rounded-sm bg-muted overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[8px] text-muted-foreground">No img</div>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.brand}{p.storage ? ` • ${p.storage}` : ''}</p>
              {p.category && <p className="text-[10px] text-muted-foreground">{p.category.name}</p>}

              {/* Badges row */}
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                {statusBadge((p.displayStock ?? p.stock) > 0 ? 'AVAILABLE' : 'SOLD')}
                <span className={`text-[10px] font-semibold ${
                  (p.displayStock ?? p.stock) <= 2 && (p.displayStock ?? p.stock) > 0
                    ? 'text-warning'
                    : (p.displayStock ?? p.stock) === 0
                    ? 'text-destructive'
                    : 'text-success'
                }`}>
                  {p.displayStock ?? p.stock} pcs
                </span>
              </div>
            </div>

            {/* Price + actions */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <p className="text-xs font-bold text-foreground">{formatCurrency(p.displayPrice ?? p.price)}</p>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/products/${p.id}/edit`} className="text-[10px] hover:underline font-semibold text-primary">
                  Edit
                </Link>
              </div>
            </div>
          </div>
        )}
        emptyState={
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <svg className="w-12 h-12 mb-4 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-semibold text-foreground">No products found.</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Adjust your search filters or add a new product to see them listed here.</p>
          </div>
        }
      />

      {/* ─── FOOTER ─── */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Showing {filteredProducts.length} of {products.length} entries</span>
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2 py-1 h-6 text-[10px]" disabled>Prev</button>
          <button className="px-2 py-1 bg-primary/10 text-primary font-bold rounded-sm h-6 text-[10px]">1</button>
          <button className="btn-ghost px-2 py-1 h-6 text-[10px]" disabled>Next</button>
        </div>
      </div>
    </div>
  )
}
