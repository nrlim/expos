'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Store {
  id: string
  name: string
}

interface Props {
  stores: Store[]
}

export function StoreSwitcher({ stores }: Props) {
  const router = useRouter()
  const [activeStore, setActiveStore] = useState<string>('')

  useEffect(() => {
    // Read from localStorage to persist user selection on client side easily
    const savedStore = localStorage.getItem('expos_active_store')
    if (savedStore && stores.some(s => s.id === savedStore)) {
      setActiveStore(savedStore)
    } else if (stores.length > 0) {
      setActiveStore(stores[0].id)
      localStorage.setItem('expos_active_store', stores[0].id)
    }
  }, [stores])

  const handleSwitchStore = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value
    setActiveStore(newVal)
    localStorage.setItem('expos_active_store', newVal)
    
    // Potentially trigger a reload or custom global state event
    // since we use a very simple setup right now, refresh current context
    router.refresh()
  }

  if (stores.length === 0) {
    return (
      <span className="text-xs text-muted-foreground mr-4">No Stores</span>
    )
  }

  return (
    <div className="flex items-center gap-2 mr-4 border-r border-border pr-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Store:</span>
      <select 
        className="h-8 max-w-[200px] rounded-sm py-1 px-2 text-xs border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-semibold"
        value={activeStore}
        onChange={handleSwitchStore}
      >
        <option value="ALL">All Stores Overview</option>
        {stores.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
