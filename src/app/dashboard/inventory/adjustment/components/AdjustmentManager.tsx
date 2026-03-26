'use client'

import React, { useState } from 'react'
import { adjustStock } from '@/app/actions/inventory'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  totalStock: number
  inventories: { storeId: string; stock: number }[]
}

interface Store {
  id: string
  name: string
}

interface Props {
  products: Product[]
  stores: Store[]
}

export function AdjustmentManager({ products, stores }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  // Derive current quantity based on store and product selection
  const currentQty = React.useMemo(() => {
    if (!selectedStoreId || !selectedProductId) return null
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return null
    const inv = product.inventories.find(i => i.storeId === selectedStoreId)
    return inv ? inv.stock : 0
  }, [products, selectedStoreId, selectedProductId])

  const handleAdjust = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const res = await adjustStock(fd)
    setPending(false)
    if (!res.success) {
      setError(res.error || 'Failed to adjust stock')
    } else {
      router.push('/dashboard/inventory')
    }
  }

  return (
    <div className="card w-full p-6 animate-fade-in">
      <h2 className="text-lg font-bold mb-4">Stock Adjustment</h2>
      <p className="text-sm text-muted-foreground mb-6">Use this form to add or deduct stock for a specific product at a specific store. Reasons include damages, manual counts, or initial stock loading.</p>
      
      <form onSubmit={handleAdjust} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Store</label>
            <select 
              name="storeId" 
              className="field-input" 
              required
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
            >
              <option value="">Select a store...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Product</label>
            <select 
              name="productId" 
              className="field-input" 
              required
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select a product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {currentQty !== null && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Current stock: <span className="font-bold text-foreground">{currentQty}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="field-label">Quantity Adjustment (+/-)</label>
          <input type="number" name="quantityStr" placeholder="e.g. 5 or -2" required className="field-input w-full" />
          <p className="text-[11px] text-muted-foreground mt-1">Use a negative number to deduct stock.</p>
        </div>

        <div>
          <label className="field-label">Notes / Reason</label>
          <textarea name="notes" placeholder="e.g. Stock count variation" rows={2} className="field-input w-full" />
        </div>

        {error && <p className="field-error mt-2">{error}</p>}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={pending} className="btn-primary min-w-[120px]">
            {pending ? 'Processing...' : 'Adjust Stock'}
          </button>
        </div>
      </form>
    </div>
  )
}
