'use client'

import React, { useRef, useState } from 'react'
import { createProduct, updateProduct } from '@/app/actions/product'
import { ImageUploadDropzone } from '@/components/dashboard/ImageUploadDropzone'

// ─── Currency Input ───────────────────────────────────────────────────────────

function CurrencyInput({
  name, required, defaultValue, placeholder, className, id,
}: {
  name: string; required?: boolean; defaultValue?: number | null
  placeholder?: string; className?: string; id?: string
}) {
  const [display, setDisplay] = useState(
    defaultValue ? new Intl.NumberFormat('id-ID').format(defaultValue) : ''
  )
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.value.replace(/\D/g, '')
    setDisplay(n ? new Intl.NumberFormat('id-ID').format(Number(n)) : '')
  }
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-bold select-none">
        Rp
      </span>
      <input
        id={id}
        type="text"
        className={className || 'field-input pl-8'}
        placeholder={placeholder ?? '0'}
        value={display}
        onChange={handleChange}
        required={required}
        autoComplete="off"
      />
      <input type="hidden" name={name} value={display.replace(/\D/g, '')} />
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category  { id: string; name: string; children?: { id: string; name: string }[] }
interface Store     { id: string; name: string }
interface Brand     { id: string; name: string }
interface Unit      { id: string; name: string; shortName: string }
interface Warranty  { id: string; name: string; duration: number; durationUnit: string }
interface AttrValue { id: string; value: string }
interface Attribute { id: string; name: string; values: AttrValue[] }

interface ProductFormProps {
  categories?: Category[]
  stores?: Store[]
  brands?: Brand[]
  units?: Unit[]
  warranties?: Warranty[]
  attributes?: Attribute[]
  initialData?: any
}

// ─── ProductForm ──────────────────────────────────────────────────────────────

export function ProductForm({
  categories = [], stores = [], brands = [], units = [],
  warranties = [], attributes = [], initialData,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError]             = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, setIsPending]     = useState(false)
  const [sku, setSku]                 = useState(initialData?.sku || '')

  // Attribute picker
  type PickedAttr = { attr: Attribute; valueId: string }
  const buildInitial = () => {
    const m = new Map<string, PickedAttr>()
    if (initialData?.attributeValues) {
      for (const av of initialData.attributeValues) {
        const attr = attributes.find(a => a.id === av.attributeId)
        if (attr) m.set(attr.id, { attr, valueId: av.attributeValueId })
      }
    }
    return m
  }
  const [picked, setPicked]               = useState<Map<string, PickedAttr>>(buildInitial)
  const [pickerAttrId, setPickerAttrId]   = useState('')
  const [pickerValueId, setPickerValueId] = useState('')

  const availableAttrs = attributes.filter(a => !picked.has(a.id))
  const pickerAttr     = attributes.find(a => a.id === pickerAttrId) ?? null

  const addAttr = () => {
    if (!pickerAttrId || !pickerValueId) return
    const attr = attributes.find(a => a.id === pickerAttrId)!
    setPicked(prev => new Map(prev).set(attr.id, { attr, valueId: pickerValueId }))
    setPickerAttrId(''); setPickerValueId('')
  }
  const removeAttr = (id: string) =>
    setPicked(prev => { const m = new Map(prev); m.delete(id); return m })
  const updatePickedValue = (id: string, v: string) =>
    setPicked(prev => { const m = new Map(prev); const e = m.get(id); if (e) m.set(id, { ...e, valueId: v }); return m })

  const generateSKU = () =>
    setSku(`SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true); setError(null); setFieldErrors({})
    const fd = new FormData(e.currentTarget)
    const result = initialData?.id
      ? await updateProduct(initialData.id, null, fd)
      : await createProduct(null, fd)
    if (result && !result.success) {
      setError(result.error || 'Failed to save product.')
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      setIsPending(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <form ref={formRef} onSubmit={handleSubmit}>

      {/* Global error */}
      {error && (
        <div className="alert-error mb-5">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-xs">Validation Error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── 2-column layout ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* ── LEFT: Main form ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Card 1: Core Info */}
          <div className="card p-5 border-t-2 border-t-primary">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Product Information
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="field-label">Product Name <span className="text-destructive">*</span></label>
                <input id="name" name="name" className="field-input" required
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  defaultValue={initialData?.name} />
                {fieldErrors.name && <p className="field-error mt-1">{fieldErrors.name[0]}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brandId" className="field-label">Brand</label>
                  <select id="brandId" name="brandId" className="field-input bg-background"
                    defaultValue={initialData?.brandId || ''}>
                    <option value="">No Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="categoryId" className="field-label">Category</label>
                  <select id="categoryId" name="categoryId" className="field-input bg-background"
                    defaultValue={initialData?.categoryId || ''}>
                    <option value="">No Category</option>
                    {categories.map(c =>
                      c.children && c.children.length > 0 ? (
                        <optgroup key={c.id} label={c.name}>
                          <option value={c.id}>{c.name} (General)</option>
                          {c.children.map(s => (
                            <option key={s.id} value={s.id}>&nbsp;&nbsp;{s.name}</option>
                          ))}
                        </optgroup>
                      ) : (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modelName" className="field-label">Model / Series <span className="text-destructive">*</span></label>
                  <input id="modelName" name="modelName" className="field-input" required
                    placeholder="e.g. SM-S928B" defaultValue={initialData?.modelName} />
                </div>
                <div>
                  <label htmlFor="sku" className="field-label">SKU <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <div className="relative">
                    <input id="sku" name="sku" value={sku} onChange={e => setSku(e.target.value)}
                      className="field-input pr-[88px]" placeholder="Auto-generated or manual"
                      autoComplete="off" />
                    <button type="button" onClick={generateSKU}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 px-2 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-sm transition-colors">
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="field-label">Description / Notes</label>
                <textarea id="description" name="description" rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  placeholder="Product details, conditions, or internal notes..."
                  defaultValue={initialData?.description || ''} />
              </div>
            </div>
          </div>

          {/* Card 2: Specifications */}
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Specifications
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label htmlFor="condition" className="field-label">Condition <span className="text-destructive">*</span></label>
                <select id="condition" name="condition" className="field-input bg-background"
                  required defaultValue={initialData?.condition || 'New'}>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label htmlFor="warrantyId" className="field-label">Warranty</label>
                <select id="warrantyId" name="warrantyId" className="field-input bg-background"
                  defaultValue={initialData?.warrantyId || ''}>
                  <option value="">No Warranty</option>
                  {warranties.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}{w.duration > 0 ? ` · ${w.duration} ${w.durationUnit}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="storage" className="field-label">Variant / Capacity</label>
                <div className="flex gap-2">
                  <input id="storage" name="storage" className="field-input flex-1"
                    placeholder="e.g. 256, Large, 500ml"
                    defaultValue={initialData?.storage || ''} />
                  <select name="unitId" className="field-input w-[90px] shrink-0 bg-background"
                    defaultValue={initialData?.unitId || ''}>
                    <option value="">Unit</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.shortName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="batteryHealth" className="field-label">Quality / Condition (%)</label>
                <input id="batteryHealth" name="batteryHealth" type="number" min="0" max="100"
                  className="field-input" placeholder="e.g. 95"
                  defaultValue={initialData?.batteryHealth || ''} />
                <p className="text-[10px] text-muted-foreground mt-1">Battery health or overall quality score.</p>
              </div>
            </div>

            {/* Attribute picker */}
            {attributes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Additional Attributes
                  </p>
                  {picked.size > 0 && (
                    <span className="badge badge-neutral">{picked.size} added</span>
                  )}
                </div>

                {/* Active rows */}
                {picked.size > 0 && (
                  <div className="space-y-2 mb-3">
                    {Array.from(picked.values()).map(({ attr, valueId }) => (
                      <div key={attr.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border border-border/40">
                        <input type="hidden" name="attributeIds" value={attr.id} />
                        <input type="hidden" name={`attr_${attr.id}`} value={valueId} />
                        <span className="text-[11px] font-semibold text-foreground w-16 shrink-0 truncate">
                          {attr.name}
                        </span>
                        <select
                          className="field-input flex-1 h-7 text-xs py-0 bg-background"
                          value={valueId}
                          onChange={e => updatePickedValue(attr.id, e.target.value)}
                        >
                          {attr.values.map(v => <option key={v.id} value={v.id}>{v.value}</option>)}
                        </select>
                        <button type="button" onClick={() => removeAttr(attr.id)}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add picker */}
                {availableAttrs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      className="field-input flex-1 h-8 text-xs bg-background"
                      value={pickerAttrId}
                      onChange={e => { setPickerAttrId(e.target.value); setPickerValueId('') }}
                    >
                      <option value="">Select attribute...</option>
                      {availableAttrs.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select
                      className="field-input flex-1 h-8 text-xs bg-background"
                      value={pickerValueId}
                      onChange={e => setPickerValueId(e.target.value)}
                      disabled={!pickerAttr}
                    >
                      <option value="">Select value...</option>
                      {pickerAttr?.values.map(v => <option key={v.id} value={v.id}>{v.value}</option>)}
                    </select>
                    <button type="button" onClick={addAttr}
                      disabled={!pickerAttrId || !pickerValueId}
                      className="shrink-0 h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition-colors">
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Pricing */}
          <div className="card p-5 border border-brand/20 bg-brand/[0.02]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-4">
              Pricing
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="field-label">Selling Price <span className="text-destructive">*</span></label>
                <CurrencyInput id="price" name="price"
                  className="field-input pl-8 border-brand/30 focus-visible:ring-brand"
                  required defaultValue={initialData?.price} placeholder="0" />
                {fieldErrors.price && <p className="field-error mt-1">{fieldErrors.price[0]}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">Base price across all stores.</p>
              </div>
              <div>
                <label htmlFor="costPrice" className="field-label">Purchase Cost <span className="text-muted-foreground font-normal">(COGS)</span></label>
                <CurrencyInput id="costPrice" name="costPrice"
                  defaultValue={initialData?.costPrice} placeholder="0" />
                <p className="text-[10px] text-muted-foreground mt-1">Used for margin reporting only.</p>
              </div>
            </div>
          </div>

          {/* Card 4: Store Inventory */}
          {stores.length > 0 && (
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Store Inventory
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stores.map(store => (
                  <div key={store.id} className="border border-border rounded-md p-3 bg-background space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" name="storeIds" value={store.id}
                        className="accent-primary w-3.5 h-3.5 cursor-pointer" defaultChecked />
                      <span className="text-xs font-semibold text-foreground">{store.name}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Opening Stock</label>
                        <input name={`stock_${store.id}`} type="number" min="0" step="1"
                          className="field-input h-8"
                          defaultValue={initialData?.inventories?.find((i: any) => i.storeId === store.id)?.stock ?? 0} />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground block mb-1">Price Override</label>
                        <CurrencyInput name={`price_${store.id}`}
                          className="field-input pl-8 h-8 text-xs"
                          defaultValue={initialData?.inventories?.find((i: any) => i.storeId === store.id)?.price ?? null}
                          placeholder="Base" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT: Photo ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Product Photo
            </p>
            {initialData?.imageUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted/10">
                  <img src={initialData.imageUrl} alt="Product"
                    className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">Upload below to replace</p>
                <ImageUploadDropzone name="image" label="Replace Photo" />
              </div>
            ) : (
              <ImageUploadDropzone name="image" label="Upload Photo" />
            )}
          </div>

          {/* Sticky tips */}
          <div className="rounded-md border border-border/50 bg-muted/10 p-4 text-[11px] text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground text-xs">Tips</p>
            <p>Fill in product name and condition at minimum to save.</p>
            <p>Use attributes to add extra specs like Color or Storage.</p>
            <p>Per-store price override will apply instead of the base price.</p>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-destructive font-bold">*</span> are required.
        </p>
        <button type="submit" className="btn-primary px-10 h-9" disabled={isPending}>
          {isPending ? 'Saving...' : initialData?.id ? 'Update Product' : 'Save Product'}
        </button>
      </div>

    </form>
  )
}
