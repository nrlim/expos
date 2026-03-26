'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { deleteProduct } from '@/app/actions/product'

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

  // Listen to LocalStorage mutations from TopBar (Polling or event)
  React.useEffect(() => {
    const checkStore = () => {
      const savedStore = localStorage.getItem('expos_active_store') || 'ALL'
      if (savedStore !== activeStore) setActiveStore(savedStore)
    }
    checkStore()
    const interval = setInterval(checkStore, 1000) // Simple sync for the mock switch
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
  }, [products, search, categoryFilter])

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

  return (
    <div className="space-y-4">
      {/* ─── FILTERS & HEADER BAR ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="field-input w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="field-input w-full sm:w-40"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-muted-foreground mr-1">
                {selectedIds.size} selected
              </span>
              <button 
                className="btn-danger"
                onClick={() => handleDelete(Array.from(selectedIds))}
              >
                Delete
              </button>
            </div>
          )}
          <Link href="/dashboard/products/new" className="btn-primary w-full sm:w-auto">
            + Add Product
          </Link>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      <div className="card overflow-x-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-12 h-12 mb-4 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-semibold text-foreground">No products found.</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Adjust your search filters or add a new product to see them listed here.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8">
                  <input 
                    type="checkbox" 
                    className="accent-primary cursor-pointer w-4 h-4 rounded-sm"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Image</th>
                <th>Name & SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.has(p.id)
                return (
                  <tr key={p.id} className={isSelected ? 'bg-primary/5' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="accent-primary cursor-pointer w-4 h-4 rounded-sm"
                        checked={isSelected}
                        onChange={() => toggleOne(p.id)}
                      />
                    </td>
                    <td className="w-12">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-sm object-cover bg-muted" />
                      ) : (
                        <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-[8px] text-muted-foreground">No img</div>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.brand} {p.storage ? `• ${p.storage}` : ''}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground">
                      {p.category?.name || '—'}
                    </td>
                    <td className="font-medium text-foreground">
                      {formatCurrency(p.displayPrice)}
                    </td>
                    <td className="text-muted-foreground">{p.condition}</td>
                    <td>{statusBadge(p.displayStock > 0 ? 'AVAILABLE' : 'SOLD')}</td>
                    <td>
                      <span className={`font-semibold ${p.displayStock <= 2 && p.displayStock > 0 ? 'text-warning' : p.displayStock === 0 ? 'text-destructive' : 'text-success'}`}>
                        {p.displayStock}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3 opacity-60 hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/products/${p.id}/edit`} className="text-[10px] hover:underline font-semibold hover:text-primary">
                          Edit
                        </Link>
                        <button type="button" className="text-[10px] hover:underline font-semibold hover:text-primary text-muted-foreground">
                          Duplicate
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

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
