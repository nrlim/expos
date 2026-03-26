'use client'

import React, { useState } from 'react'
import { transferStock } from '@/app/actions/inventory'
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

export function TransferManager({ products, stores }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedSourceStoreId, setSelectedSourceStoreId] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  // Derive current quantity in the source store
  const sourceQty = React.useMemo(() => {
    if (!selectedSourceStoreId || !selectedProductId) return null
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return null
    const inv = product.inventories.find(i => i.storeId === selectedSourceStoreId)
    return inv ? inv.stock : 0
  }, [products, selectedSourceStoreId, selectedProductId])

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const res = await transferStock(fd)
    setPending(false)
    if (!res.success) {
      setError(res.error || 'Failed to transfer stock')
    } else {
      router.push('/dashboard/inventory')
    }
  }

  return (
    <div className="card w-full p-6 animate-fade-in">
      <h2 className="text-lg font-bold mb-4">Transfer Stock</h2>
      <p className="text-sm text-muted-foreground mb-6">Move inventory securely between your physical stores. This will create a transfer record.</p>
      
      <form onSubmit={handleTransfer} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Source Store (From)</label>
            <select 
              name="sourceStoreId" 
              className="field-input" 
              required
              value={selectedSourceStoreId}
              onChange={(e) => setSelectedSourceStoreId(e.target.value)}
            >
              <option value="">Select source...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Target Store (To)</label>
            <select name="targetStoreId" className="field-input" required>
              <option value="">Select target...</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
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
          {sourceQty !== null && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Available to transfer: <span className="font-bold text-foreground">{sourceQty}</span>
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Quantity to Transfer</label>
          <input type="number" name="quantityStr" min="1" placeholder="e.g. 10" required className="field-input w-full" />
        </div>

        <div>
          <label className="field-label">Notes (Optional)</label>
          <textarea name="notes" placeholder="e.g. Replenishing branch B" rows={2} className="field-input w-full" />
        </div>

        {error && <p className="field-error mt-2">{error}</p>}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={pending} className="btn-primary min-w-[120px]">
            {pending ? 'Processing...' : 'Transfer Stock'}
          </button>
        </div>
      </form>
    </div>
  )
}
