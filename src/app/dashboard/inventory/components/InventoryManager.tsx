'use client'

import React, { useState, useMemo } from 'react'

interface InventoryItem {
  storeId: string
  stock: number
  price: number | null
}

interface Product {
  id: string
  name: string
  brand: string
  sku: string
  price: number
  imageUrl: string | null
  totalStock: number
  inventories: InventoryItem[]
}

interface Store {
  id: string
  name: string
  location: string | null
}

interface Props {
  products: Product[]
  stores: Store[]
}

export function InventoryManager({ products, stores }: Props) {
  const [search, setSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('ALL')

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase())
      
      const matchStore = selectedStore === 'ALL' 
        ? true 
        : p.inventories.some(inv => inv.storeId === selectedStore && inv.stock > 0)
        
      return matchSearch && matchStore
    })
  }, [products, search, selectedStore])

  return (
    <div className="space-y-6">
      
      <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="field-input w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="field-input w-full sm:w-48"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="ALL">All Stores</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="card overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No products found matching your criteria.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stores & Stock</th>
                    <th className="text-right">Total Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                           {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-sm object-cover bg-muted" />
                          ) : (
                            <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-[10px] uppercase text-muted-foreground">IMG</div>
                          )}
                          <div>
                            <p className="font-semibold text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sku || p.brand || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {stores.map(s => {
                            const inv = p.inventories.find(i => i.storeId === s.id)
                            const stock = inv?.stock || 0
                            return (
                              <div key={s.id} className="flex flex-col bg-muted/30 px-2 py-1.5 border border-border/50 rounded-md">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{s.name}</span>
                                <span className={`text-xs font-semibold ${stock > 0 ? 'text-success' : 'text-muted-foreground'}`}>{stock} in stock</span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="text-right">
                        <span className={`text-sm font-bold ${p.totalStock > 0 ? 'text-foreground' : 'text-destructive'}`}>
                          {p.totalStock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
      </div>
    </div>
  )
}
