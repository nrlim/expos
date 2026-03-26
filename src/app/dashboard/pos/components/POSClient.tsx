'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from 'react'
import { getPOSProducts, processCheckout } from '@/app/actions/pos'
import type { POSProduct, CheckoutItem } from '@/app/actions/pos'

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-4 w-4">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-3.5 w-3.5">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="h-3 w-3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="h-3 w-3">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const XIcon = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    className={size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5'}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PackageIcon = ({ className = 'h-8 w-8' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" className="h-5 w-5 animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="h-10 w-10">
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
)

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-3 w-3">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-3 w-3">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-12 w-12 text-success">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-3 w-3">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
)

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    className="h-5 w-5">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)

// ─── Types ────────────────────────────────────────────────────────────────────

type CartItem = {
  product: POSProduct
  quantity: number
  unitPrice: number
}

type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'CREDIT'

// ─── Formatter ────────────────────────────────────────────────────────────────

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  session: {
    userId: string
    username: string
    role: string
    tenantId: string
    tenantName: string
  }
  stores: { id: string; name: string; location: string | null }[]
  categories: { id: string; name: string; imageUrl?: string | null }[]
}

// ─── Category Sidebar ─────────────────────────────────────────────────────────

function CategorySidebar({
  categories,
  active,
  onSelect,
}: {
  categories: Props['categories']
  active: string
  onSelect: (name: string) => void
}) {
  const allCategories = [
    { id: 'ALL', name: 'All', imageUrl: null },
    ...categories,
  ]

  return (
    <aside className="flex w-[82px] shrink-0 flex-col overflow-y-auto border-r border-border bg-card">
      <div className="flex flex-col gap-1 p-2">
        {allCategories.map((cat) => {
          const isActive = active === cat.name || (cat.id === 'ALL' && active === 'ALL')
          const initials = cat.name === 'All' ? '★' : cat.name.slice(0, 2).toUpperCase()

          return (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => onSelect(cat.id === 'ALL' ? 'ALL' : cat.name)}
              className={`group flex flex-col items-center gap-1.5 rounded-sm border px-1 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-transparent hover:border-border hover:bg-muted/60'
              }`}
            >
              {/* Category image or letter avatar */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border transition-colors ${
                  isActive
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/60 bg-muted/50 group-hover:border-primary/30'
                }`}
              >
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : cat.name === 'All' ? (
                  <GridIcon />
                ) : (
                  <span
                    className={`text-sm font-black ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {initials}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`w-full text-center text-[9px] font-bold leading-tight tracking-wide line-clamp-2 ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Variant Modal ────────────────────────────────────────────────────────────

function VariantModal({
  product,
  onConfirm,
  onClose,
}: {
  product: POSProduct
  onConfirm: (product: POSProduct) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-sm border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Product Variants
            </p>
            <h2 className="mt-0.5 text-sm font-bold text-foreground">{product.name}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" id="btn-close-variant-modal">
            <XIcon size="md" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {product.attributeValues.map(({ attribute, attributeValue }) => (
            <div key={attribute.id}>
              <p className="field-label mb-2">{attribute.name}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-sm border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  {attributeValue.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-5 mb-4 rounded-sm border border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{product.condition} Condition</p>
              {product.warrantyRel && (
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-success">
                  <ShieldIcon />
                  {product.warrantyRel.duration} {product.warrantyRel.durationUnit} Warranty
                </p>
              )}
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatIDR(product.storeInventory?.price ?? product.price)}
            </p>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Stock: <span className="font-semibold text-foreground">{product.storeInventory?.stock ?? 0}</span> unit(s)
          </p>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} className="btn-ghost flex-1" id="btn-variant-cancel">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(product)}
            className="btn-primary flex-1 justify-center"
            id="btn-variant-add"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

const QUICK_CASH = [5000, 10000, 20000, 50000, 100000, 200000]

function PaymentModal({
  total,
  onConfirm,
  onClose,
  isPending,
}: {
  total: number
  onConfirm: (method: PaymentMethod, paid: number, discount: number, notes: string) => void
  onClose: () => void
  isPending: boolean
}) {
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [paid, setPaid] = useState(total)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')

  const discountedTotal = Math.round(total - total * (discount / 100))
  const change = method === 'CASH' ? Math.max(0, paid - discountedTotal) : 0
  const isInsufficient = method === 'CASH' && paid < discountedTotal

  const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
    { id: 'CASH', label: 'Cash' },
    { id: 'QRIS', label: 'QRIS' },
    { id: 'DEBIT', label: 'Debit' },
    { id: 'CREDIT', label: 'Credit' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-sm border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Process Payment
            </p>
            <h2 className="mt-0.5 text-sm font-bold text-foreground">
              Grand Total: {formatIDR(discountedTotal)}
            </h2>
          </div>
          <button onClick={onClose} id="btn-close-payment-modal" className="btn-ghost p-1.5">
            <XIcon size="md" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <p className="field-label mb-2">Payment Method</p>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(({ id, label }) => (
                <button
                  key={id}
                  id={`btn-pay-${id.toLowerCase()}`}
                  onClick={() => setMethod(id)}
                  className={`rounded-sm border py-2.5 text-xs font-semibold transition-colors ${
                    method === id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="discount-input">Discount (%)</label>
              <input
                id="discount-input"
                type="number" min="0" max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="field-input mt-1"
              />
            </div>
            <div>
              <p className="field-label">After Discount</p>
              <p className="mt-1 flex h-8 items-center text-sm font-bold text-foreground">
                {formatIDR(discountedTotal)}
              </p>
            </div>
          </div>

          {method === 'CASH' && (
            <div>
              <label className="field-label" htmlFor="amount-paid-input">Amount Paid (IDR)</label>
              <input
                id="amount-paid-input"
                type="number" min="0"
                value={paid}
                onChange={(e) => setPaid(Number(e.target.value))}
                className={`field-input mt-1 ${isInsufficient ? 'border-destructive ring-1 ring-destructive' : ''}`}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_CASH.map((v) => (
                  <button
                    key={v}
                    id={`btn-quickcash-${v}`}
                    onClick={() => setPaid((prev) => prev + v)}
                    className="rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    +{(v / 1000).toFixed(0)}K
                  </button>
                ))}
                <button
                  id="btn-quickcash-exact"
                  onClick={() => setPaid(discountedTotal)}
                  className="rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
                >
                  Exact
                </button>
              </div>

              <div className={`mt-3 flex items-center justify-between rounded-sm border px-4 py-3 ${isInsufficient ? 'border-destructive/50 bg-destructive/10' : 'border-success/30 bg-success/10'}`}>
                <p className={`text-xs font-semibold ${isInsufficient ? 'text-destructive' : 'text-success'}`}>
                  {isInsufficient ? 'Insufficient Payment' : 'Change'}
                </p>
                <p className={`text-base font-bold ${isInsufficient ? 'text-destructive' : 'text-success'}`}>
                  {isInsufficient ? `-${formatIDR(discountedTotal - paid)}` : formatIDR(change)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="payment-notes-input">Notes (optional)</label>
            <input
              id="payment-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer request, special conditions..."
              className="field-input mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} disabled={isPending} className="btn-ghost flex-1" id="btn-payment-cancel">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(method, paid, discount, notes)}
            disabled={isPending || (method === 'CASH' && isInsufficient)}
            id="btn-payment-confirm"
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-success px-4 py-2 text-sm font-bold text-success-foreground shadow-sm hover:bg-success/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isPending ? <><LoaderIcon /> Processing...</> : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({
  transactionId,
  change,
  onClose,
}: {
  transactionId: string
  change: number
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-sm border border-border bg-card p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-4"><CheckCircleIcon /></div>
        <h2 className="text-lg font-bold text-foreground">Payment Successful</h2>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          TXN: {transactionId.slice(0, 12).toUpperCase()}
        </p>
        {change > 0 && (
          <div className="mt-4 rounded-sm border border-success/30 bg-success/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className="text-2xl font-black text-success">{formatIDR(change)}</p>
          </div>
        )}
        <button
          id="btn-success-close"
          onClick={onClose}
          className="btn-primary mt-6 w-full justify-center text-sm py-2.5"
        >
          New Transaction
        </button>
      </div>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onAdd }: { product: POSProduct; onAdd: (p: POSProduct) => void }) {
  const stock = product.storeInventory?.stock ?? 0
  const displayPrice = product.storeInventory?.price ?? product.price
  const isLowStock = stock > 0 && stock <= 3
  const hasVariants = product.attributeValues.length > 0

  return (
    <button
      id={`product-card-${product.id}`}
      onClick={() => onAdd(product)}
      disabled={stock === 0}
      className={`group relative flex flex-col rounded-sm border bg-card text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed ${
        stock > 0
          ? 'border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5'
          : 'border-border/40'
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-sm bg-muted/40 aspect-[4/3]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <PackageIcon />
          </div>
        )}

        {isLowStock && (
          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-none border border-warning/50 bg-warning/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-warning">
            <WarningIcon />Low Stock
          </span>
        )}
        {(product.warrantyRel || product.warranty) && (
          <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-none border border-success/40 bg-success/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-success">
            <ShieldIcon />Warranty
          </span>
        )}
        {hasVariants && (
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-none border border-accent-foreground/30 bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent-foreground">
            <TagIcon />Variant
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5">
        <p className="line-clamp-1 text-[11px] font-bold text-foreground leading-tight">{product.name}</p>
        <p className="line-clamp-1 text-[10px] text-muted-foreground">{product.modelName}</p>

        {hasVariants && (
          <div className="mt-1 flex flex-wrap gap-1">
            {product.attributeValues.slice(0, 2).map(({ attribute, attributeValue }) => (
              <span
                key={attribute.id}
                className="rounded-none border border-border/80 bg-secondary/80 px-1 py-0.5 text-[9px] font-semibold text-secondary-foreground"
              >
                {attribute.name}: {attributeValue.value}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-xs font-black text-foreground leading-none">{formatIDR(displayPrice)}</p>
            <p className={`mt-0.5 text-[9px] font-semibold ${isLowStock ? 'text-warning' : 'text-muted-foreground'}`}>
              {stock} {product.unit?.shortName ?? 'pcs'} left
            </p>
          </div>
          <span className="rounded-none border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
            {product.condition}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Main POSClient ───────────────────────────────────────────────────────────

export function POSClient({ session, stores, categories }: Props) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [activeStoreId, setActiveStoreId] = useState<string>('')
  const [products, setProducts] = useState<POSProduct[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [cart, setCart] = useState<CartItem[]>([])
  const [variantProduct, setVariantProduct] = useState<POSProduct | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ id: string; change: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // ── For ADMIN/OWNER: hide main sidebar when on POS, restore on unmount ──
  const isCashier = session.role === 'CASHIER'
  useEffect(() => {
    if (isCashier) return // CASHIER has no sidebar (returns null from Sidebar component)
    const sidebar = document.querySelector('aside') as HTMLElement | null
    if (sidebar) sidebar.style.display = 'none'
    return () => {
      if (sidebar) sidebar.style.display = ''
    }
  }, [isCashier])

  // ── Init store from localStorage ──
  useEffect(() => {
    const saved = localStorage.getItem('expos_active_store')
    if (saved && stores.some((s) => s.id === saved)) {
      setActiveStoreId(saved)
    } else if (stores.length > 0) {
      setActiveStoreId(stores[0].id)
    }
  }, [stores])

  // ── Load products when store changes ──
  useEffect(() => {
    if (!activeStoreId) return
    setIsLoadingProducts(true)
    setLoadError(null)
    getPOSProducts(activeStoreId).then((res) => {
      if (res.success && res.data) setProducts(res.data)
      else setLoadError(res.error ?? 'Failed to load products.')
      setIsLoadingProducts(false)
    })
  }, [activeStoreId])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    searchInputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setVariantProduct(null)
        setShowPayment(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Filtered products ──
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.modelName.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q) ?? false)
    const matchCategory = categoryFilter === 'ALL' || p.category?.name === categoryFilter
    return matchSearch && matchCategory
  })

  // ── Cart logic ──
  const addToCart = useCallback((product: POSProduct) => {
    const unitPrice = product.storeInventory?.price ?? product.price
    const maxStock = product.storeInventory?.stock ?? 0
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= maxStock) return prev
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1, unitPrice }]
    })
    setVariantProduct(null)
  }, [])

  const handleAddProduct = useCallback(
    (product: POSProduct) => {
      if (product.attributeValues.length > 0) {
        setVariantProduct(product)
        return
      }
      addToCart(product)
    },
    [addToCart]
  )

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== productId) return i
          const maxStock = i.product.storeInventory?.stock ?? 999
          return { ...i, quantity: Math.min(maxStock, Math.max(0, i.quantity + delta)) }
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId))

  const clearCart = () => setCart([])

  // ── Totals ──
  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const TAX_RATE = 0
  const taxAmount = Math.round(subtotal * TAX_RATE)
  const grandTotal = subtotal + taxAmount

  // ── Checkout ──
  const handleCheckout = (
    method: PaymentMethod,
    paid: number,
    discount: number,
    notes: string
  ) => {
    setCheckoutError(null)
    const items: CheckoutItem[] = cart.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }))
    startTransition(async () => {
      const result = await processCheckout({
        storeId: activeStoreId,
        paymentMethod: method,
        amountPaid: paid,
        discount,
        notes,
        items,
      })
      if (result.success) {
        setShowPayment(false)
        setCart([])
        setSearch('')
        setSuccessInfo({ id: result.transactionId!, change: result.change ?? 0 })
        getPOSProducts(activeStoreId).then((res) => {
          if (res.success && res.data) setProducts(res.data)
        })
        searchInputRef.current?.focus()
      } else {
        setCheckoutError(result.error ?? 'Checkout failed.')
      }
    })
  }

  const handleStoreChange = (storeId: string) => {
    setActiveStoreId(storeId)
    localStorage.setItem('expos_active_store', storeId)
    setCart([])
    setSearch('')
    setCategoryFilter('ALL')
  }

  const activeStore = stores.find((s) => s.id === activeStoreId)

  return (
    <>
      {/* ── Modals ── */}
      {variantProduct && (
        <VariantModal
          product={variantProduct}
          onConfirm={addToCart}
          onClose={() => setVariantProduct(null)}
        />
      )}
      {showPayment && (
        <PaymentModal
          total={grandTotal}
          onConfirm={handleCheckout}
          onClose={() => { setShowPayment(false); setCheckoutError(null) }}
          isPending={isPending}
        />
      )}
      {successInfo && (
        <SuccessModal
          transactionId={successInfo.id}
          change={successInfo.change}
          onClose={() => setSuccessInfo(null)}
        />
      )}

      {/* ── 3-Column POS Layout ── */}
      <div className="flex h-full w-full overflow-hidden">

        {/* ── COL 1: Category Sidebar ── */}
        <CategorySidebar
          categories={categories}
          active={categoryFilter}
          onSelect={setCategoryFilter}
        />

        {/* ── COL 2: Product Gallery ── */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-border">

          {/* Top bar: Store + Search */}
          <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
            {/* Store selector */}
            <select
              id="pos-store-select"
              value={activeStoreId}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="h-8 rounded-sm border border-border bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shrink-0 max-w-[160px]"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                id="pos-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${categoryFilter === 'ALL' ? 'all categories' : categoryFilter}... (Press / to focus)`}
                className="field-input pl-8 pr-4"
              />
            </div>

            {/* Stats chip */}
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {isLoadingProducts ? (
                <span className="flex items-center gap-1"><LoaderIcon />Loading...</span>
              ) : (
                <>
                  <span className="font-bold text-foreground">{filteredProducts.length}</span>
                  {' '}items
                  {activeStore && <> · <span className="font-semibold">{activeStore.name}</span></>}
                </>
              )}
            </span>

            <p className="shrink-0 text-[10px] text-muted-foreground hidden lg:block">
              Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">/</kbd> to search
            </p>
          </div>

          {/* Active category label */}
          {categoryFilter !== 'ALL' && (
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {categoryFilter}
              </p>
              <button
                onClick={() => setCategoryFilter('ALL')}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon />
                Clear filter
              </button>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoadingProducts ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <LoaderIcon />
                <p className="text-xs">Loading products...</p>
              </div>
            ) : loadError ? (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <p className="text-sm text-destructive font-medium">{loadError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <PackageIcon className="h-10 w-10" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={handleAddProduct} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── COL 3: Cart & Summary ── */}
        <div className="flex w-[340px] shrink-0 flex-col bg-card xl:w-[380px]">

          {/* Cart header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">Transaction Cart</p>
              {cart.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                id="btn-clear-cart"
                onClick={clearCart}
                className="flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <XIcon />Clear
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground/40 p-6">
                <ShoppingCartIcon />
                <div className="text-center">
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs mt-1">Click a product to add items</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {cart.map((item) => {
                  const stock = item.product.storeInventory?.stock ?? 0
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-2.5 px-4 py-3 hover:bg-muted/20 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-muted/50">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                            <PackageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Info + qty */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground leading-tight line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {item.product.modelName}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button
                            id={`btn-qty-minus-${item.product.id}`}
                            onClick={() => updateQty(item.product.id, -1)}
                            className="flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <MinusIcon />
                          </button>
                          <span className="min-w-[24px] text-center text-xs font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            id={`btn-qty-plus-${item.product.id}`}
                            onClick={() => updateQty(item.product.id, 1)}
                            disabled={item.quantity >= stock}
                            className="flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-background hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            <PlusIcon />
                          </button>
                          <span className="text-[9px] text-muted-foreground">/ {stock}</span>
                        </div>
                      </div>

                      {/* Price + remove */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <p className="text-xs font-bold text-foreground">
                          {formatIDR(item.unitPrice * item.quantity)}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {formatIDR(item.unitPrice)} each
                        </p>
                        <button
                          id={`btn-remove-${item.product.id}`}
                          onClick={() => removeItem(item.product.id)}
                          className="rounded-sm p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Summary + checkout */}
          <div className="border-t border-border bg-muted/10 px-4 py-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-foreground">{formatIDR(subtotal)}</span>
              </div>
              {TAX_RATE > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>PPN ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span className="font-medium text-foreground">{formatIDR(taxAmount)}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-sm border border-border bg-background px-3 py-2.5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Grand Total
              </span>
              <span className="text-xl font-black text-foreground">{formatIDR(grandTotal)}</span>
            </div>

            {checkoutError && (
              <p className="mt-2 text-[11px] text-destructive font-medium">{checkoutError}</p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                id="btn-cancel-cart"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="btn-ghost border border-border text-xs py-2.5 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                id="btn-checkout"
                onClick={() => { setCheckoutError(null); setShowPayment(true) }}
                disabled={cart.length === 0 || !activeStoreId}
                className="flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Pay / Checkout
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-[9px] text-muted-foreground">
                Cashier: <span className="font-semibold">{session.username}</span>
              </p>
              <p className="text-[9px] text-muted-foreground font-mono">
                {new Date().toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
