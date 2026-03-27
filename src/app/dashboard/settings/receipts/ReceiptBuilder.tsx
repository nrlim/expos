'use client'

import { useState, useEffect } from 'react'
import { getReceiptConfig, saveReceiptConfig } from '@/app/actions/receipt'

interface Store {
  id: string
  name: string
}

export default function ReceiptBuilder({ stores }: { stores: Store[] }) {
  const [selectedStore, setSelectedStore] = useState(stores[0]?.id || '')
  
  const [formData, setFormData] = useState({
    logoUrl: '',
    storeName: '',
    address: '',
    phoneNumber: '',
    footerMessage: '',
    socialHandles: '',
    autoPrint: false,
    paperWidth: 58,
  })

  // Dummy mock data for preview
  const mockTransaction = {
    id: 'TRX-12345678',
    cashierName: 'John Doe',
    date: new Date().toLocaleDateString('id-ID'),
    time: new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute:'2-digit' }),
    items: [
      { name: 'Mocha Latte iced', qty: 2, price: 25000, total: 50000 },
      { name: 'Croissant M', qty: 1, price: 15000, total: 15000 }
    ],
    subtotal: 65000,
    tax: 0,
    discount: 0,
    total: 65000,
    paymentMethod: 'QRIS',
  }

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!selectedStore) return
    let isMounted = true

    async function fetchConfig() {
      setLoading(true)
      const res = await getReceiptConfig(selectedStore)
      if (isMounted) {
        if (res.success && res.data) {
          setFormData({
            logoUrl: res.data.logoUrl || '',
            storeName: res.data.storeName || '',
            address: res.data.address || '',
            phoneNumber: res.data.phoneNumber || '',
            footerMessage: res.data.footerMessage || '',
            socialHandles: res.data.socialHandles || '',
            autoPrint: res.data.autoPrint,
            paperWidth: res.data.paperWidth,
          })
        } else {
          // Reset to defaults
          setFormData({
            logoUrl: '',
            storeName: stores.find(s => s.id === selectedStore)?.name || '',
            address: '',
            phoneNumber: '',
            footerMessage: 'Thank you for your visit!',
            socialHandles: '',
            autoPrint: false,
            paperWidth: 58,
          })
        }
        setLoading(false)
      }
    }

    fetchConfig()
    return () => { isMounted = false }
  }, [selectedStore, stores])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({
        ...prev, 
        [name]: name === 'paperWidth' ? parseInt(value, 10) : value 
      }))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Prepare FormData
    const fd = new FormData()
    fd.append('storeId', selectedStore)
    fd.append('logoUrl', formData.logoUrl)
    fd.append('storeName', formData.storeName)
    fd.append('address', formData.address)
    fd.append('phoneNumber', formData.phoneNumber)
    fd.append('footerMessage', formData.footerMessage)
    fd.append('socialHandles', formData.socialHandles)
    fd.append('autoPrint', formData.autoPrint ? 'true' : 'false')
    fd.append('paperWidth', formData.paperWidth.toString())

    const res = await saveReceiptConfig(fd)
    if (res.success) {
      alert('Receipt configuration saved successfully.')
    } else {
      alert(res.error || 'Failed to save')
    }
    
    setSaving(false)
  }

  // Helper to replace variables
  const parseVariables = (text: string) => {
    if (!text) return ''
    return text
      .replace(/{{transaction_id}}/g, mockTransaction.id)
      .replace(/{{cashier_name}}/g, mockTransaction.cashierName)
      .replace(/{{date}}/g, mockTransaction.date)
      .replace(/{{time}}/g, mockTransaction.time)
  }

  if (stores.length === 0) {
    return <div className="text-muted-foreground p-4 bg-muted/20 rounded-xl">No stores available. Please create a store first.</div>
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      
      {/* Editor Section */}
      <div className="bg-card text-card-foreground border border-border/80 shadow-sm rounded-xl overflow-hidden w-full order-2 xl:order-1">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="border-b border-border pb-4">
            <label className="block text-sm font-semibold text-foreground mb-1">Select Store Context</label>
            <select
              value={selectedStore}
              onChange={e => setSelectedStore(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1.5">Each store has its own independently configured receipt.</p>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm border-b border-border/50 pb-2 mb-4 font-bold tracking-tight text-foreground/80 uppercase">Header Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Store Name Override</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="Leave empty to use default"
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. 0812-3456-7890"
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Store address line..."
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Upload Logo URL</label>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Logo will be rendered in high-contrast grayscale on thermal.</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-sm border-b border-border/50 pb-2 mb-4 font-bold tracking-tight text-foreground/80 uppercase">Footer Configuration</h3>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Thank You Message</label>
              <textarea
                name="footerMessage"
                value={formData.footerMessage}
                onChange={handleChange}
                rows={2}
                placeholder="Thank you for shopping with us!"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Supports variables: {`{{transaction_id}}, {{cashier_name}}, {{date}}, {{time}}`}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Social Media & Websites</label>
              <textarea
                name="socialHandles"
                value={formData.socialHandles}
                onChange={handleChange}
                rows={2}
                placeholder="@ex_pos | www.expos.app"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-sm border-b border-border/50 pb-2 mb-4 font-bold tracking-tight text-foreground/80 uppercase">Print Engine Settings</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Paper Width</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="paperWidth" value="58" checked={formData.paperWidth === 58} onChange={handleChange} />
                    58mm (Narrow)
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="paperWidth" value="80" checked={formData.paperWidth === 80} onChange={handleChange} />
                    80mm (Wide)
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-md border border-border/50">
                <input
                  type="checkbox"
                  id="autoPrint"
                  name="autoPrint"
                  checked={formData.autoPrint}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
                />
                <label htmlFor="autoPrint" className="text-sm font-medium leading-none">
                  Auto-Print on Checkout
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/80 flex justify-end gap-3">
            <button 
              type="submit" 
              disabled={loading || saving} 
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-sm hover:bg-primary/90 focus:outline-hidden disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="sticky top-6 flex flex-col items-center bg-muted/10 border border-dashed border-border p-6 rounded-xl order-1 xl:order-2 h-[800px] overflow-y-auto w-full">
         <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Thermal Receipt Preview
         </h3>
         
         {/* Container simulates the printer paper width visually */}
         <div 
           className={`bg-white text-black shadow-lg mx-auto relative transition-all duration-300 ${formData.paperWidth === 58 ? 'w-[280px]' : 'w-[380px]'}`}
           style={{ fontFamily: "ui-monospace, Consolas, Monaco, 'Courier New', monospace", minHeight: '400px' }}
         >
            {/* Paper serrated edge simulation */}
            <div className="absolute top-[-4px] left-0 w-full h-[4px] bg-[radial-gradient(circle_at_4px_0,#fff_4px,transparent_5px)] bg-[length:8px_4px]" style={{filter: "drop-shadow(0px -1px 1px rgba(0,0,0,0.1))"}}></div>
            
            <div className="p-4 flex flex-col text-xs leading-relaxed filter grayscale">
               {/* Print Header */}
               <div className="text-center mb-4 flex flex-col items-center">
                  {formData.logoUrl && (
                     <img 
                       src={formData.logoUrl} 
                       alt="Store Logo" 
                       className="max-h-16 max-w-[80%] object-contain mb-2 contrast-125 brightness-90 saturate-0 mix-blend-multiply" 
                       onError={(e) => { e.currentTarget.style.display = 'none' }}
                     />
                  )}
                  <div className="font-bold text-sm uppercase tracking-tight">{formData.storeName || (stores.find(s => s.id === selectedStore)?.name || 'STORE NAME')}</div>
                  {formData.address && <div className="whitespace-pre-wrap opacity-90 mt-1 pb-1">{formData.address}</div>}
                  {formData.phoneNumber && <div className="opacity-90">Tel: {formData.phoneNumber}</div>}
               </div>

               {/* Meta Data */}
               <div className="border-t border-b border-black/20 border-dashed py-2 mb-3 space-y-0.5">
                 <div className="flex justify-between"><span>Date: {mockTransaction.date} {mockTransaction.time}</span></div>
                 <div className="flex justify-between"><span>Cashier: {mockTransaction.cashierName}</span></div>
                 <div className="flex justify-between"><span>Trx ID: {mockTransaction.id}</span></div>
               </div>

               {/* Items */}
               <div className="mb-3 w-full">
                 <table className="w-full text-left table-fixed">
                   <thead>
                     <tr className="border-b border-black/20 border-dashed">
                       <th className="font-normal w-[50%] pb-1">Item</th>
                       <th className="font-normal w-[15%] text-right pb-1">Qty</th>
                       <th className="font-normal w-[35%] text-right pb-1">Total</th>
                     </tr>
                   </thead>
                   <tbody className="align-top">
                     {mockTransaction.items.map((it, idx) => (
                       <tr key={idx}>
                         <td className="pt-1 leading-snug break-words pr-1">{it.name}</td>
                         <td className="pt-1 text-right">{it.qty}</td>
                         <td className="pt-1 text-right">{it.total.toLocaleString('id-ID')}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Payment Summary */}
               <div className="border-t border-black/20 border-dashed pt-2 space-y-0.5 font-bold">
                 <div className="flex justify-between opacity-80 font-normal"><span>Subtotal</span><span>{mockTransaction.subtotal.toLocaleString('id-ID')}</span></div>
                 <div className="flex justify-between text-[13px] pt-1 mt-1 border-t border-black/10"><span>TOTAL</span><span>Rp {mockTransaction.total.toLocaleString('id-ID')}</span></div>
                 <div className="flex justify-between opacity-80 font-normal pt-1"><span>Payment ({mockTransaction.paymentMethod})</span><span>{mockTransaction.total.toLocaleString('id-ID')}</span></div>
               </div>

               {/* Print Footer */}
               <div className="text-center mt-6 pt-4 border-t border-black/20 border-dashed text-[11px] opacity-90">
                 {formData.footerMessage && (
                   <div className="whitespace-pre-wrap mb-2">
                     {parseVariables(formData.footerMessage)}
                   </div>
                 )}
                 {formData.socialHandles && (
                    <div className="whitespace-pre-wrap mt-2 font-semibold">
                      {parseVariables(formData.socialHandles)}
                    </div>
                 )}
               </div>
            </div>

            {/* Paper serrated edge bottom */}
            <div className="absolute bottom-[-4px] left-0 w-full h-[4px] bg-[radial-gradient(circle_at_4px_4px,#fff_4px,transparent_5px)] bg-[length:8px_4px]" style={{filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))"}}></div>
         </div>
         
         <div className="mt-8 text-[11px] font-mono bg-background/50 border border-border px-3 py-1.5 rounded-sm text-muted-foreground shadow-sm">
           Preview Mode — Actual print respects hardware constraints
         </div>
      </div>

    </div>
  )
}
