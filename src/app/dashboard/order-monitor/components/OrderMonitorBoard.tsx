'use client'

import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { updateOrderStatus } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import { Volume1, Volume2, VolumeX } from 'lucide-react'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED'

interface OrderLogEntry {
  id: string
  status: OrderStatus
  note: string | null
  createdAt: Date
  changedBy: { username: string }
}

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: { id: string; name: string }
}

interface Order {
  id: string
  orderStatus: OrderStatus
  totalAmount: number
  notes: string | null
  createdAt: Date
  store: { id: string; name: string } | null
  user: { id: string; username: string }
  items: OrderItem[]
  orderLogs: OrderLogEntry[]
}

interface Store {
  id: string
  name: string
}

interface Props {
  initialOrders: Order[]
  stores: Store[]
  currentUserId: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; ring: string; dot: string; headerBg: string }> = {
  PENDING:    { label: 'Pending',    color: 'text-stone-600 dark:text-stone-300', bg: 'bg-white dark:bg-card', ring: 'ring-border hover:ring-stone-300 dark:hover:ring-stone-600', dot: 'bg-stone-400', headerBg: 'bg-stone-100/50 dark:bg-stone-900/50' },
  PROCESSING: { label: 'Processing', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-white dark:bg-card', ring: 'ring-border hover:ring-blue-300 dark:hover:ring-blue-800', dot: 'bg-blue-500', headerBg: 'bg-blue-50/50 dark:bg-blue-900/20' },
  READY:      { label: 'Ready',      color: 'text-teal-700 dark:text-teal-400', bg: 'bg-white dark:bg-card', ring: 'ring-border hover:ring-teal-300 dark:hover:ring-teal-800', dot: 'bg-teal-500', headerBg: 'bg-teal-50/50 dark:bg-teal-900/20' },
  COMPLETED:  { label: 'Completed',  color: 'text-slate-500 dark:text-slate-500', bg: 'bg-white dark:bg-card', ring: 'ring-border', dot: 'bg-slate-300', headerBg: 'bg-slate-50 dark:bg-slate-900/40' },
  CANCELLED:  { label: 'Cancelled',  color: 'text-destructive', bg: 'bg-white dark:bg-card', ring: 'ring-border', dot: 'bg-destructive', headerBg: 'bg-destructive/5' },
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING:    'PROCESSING',
  PROCESSING: 'READY',
  READY:      'COMPLETED',
  COMPLETED:  null,
  CANCELLED:  null,
}

const PREV_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING:    null,
  PROCESSING: 'PENDING',
  READY:      'PROCESSING',
  COMPLETED:  null,
  CANCELLED:  null,
}

function formatAbsoluteTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

function getTimeInStatus(order: Order): string {
  const lastLog = order.orderLogs[0]
  const since = lastLog ? new Date(lastLog.createdAt) : new Date(order.createdAt)
  const diff = Date.now() - since.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '< 1m'
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" className="shrink-0">
      {direction === 'right' ? (
        <path d="M2.5 6H9.5M9.5 6L7 3.5M9.5 6L7 8.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M9.5 6H2.5M2.5 6L5 3.5M2.5 6L5 8.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  )
}

// ─── Draggable Card Component ──────────────────────────────────────────────────

function KanbanCard({ 
  order, 
  onStatusChange, 
  isDragging = false,
  isUpdating = false
}: { 
  order: Order
  onStatusChange?: (id: string, newStatus: OrderStatus) => void
  isDragging?: boolean
  isUpdating?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: order.id,
    data: { order },
    disabled: isUpdating
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const cfg = STATUS_CONFIG[order.orderStatus]
  const next = NEXT_STATUS[order.orderStatus]
  const prev = PREV_STATUS[order.orderStatus]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex flex-col p-4 rounded-xl ring-1 shadow-sm transition-all bg-card cursor-grab active:cursor-grabbing hover:shadow-md touch-none ${cfg.ring} ${isDragging ? 'opacity-30' : 'opacity-100'} ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Updating overlay spin */}
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 rounded-xl backdrop-blur-[1px]">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-black tracking-widest text-foreground uppercase">
            #{order.id.slice(-6)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wide">
            {formatAbsoluteTime(order.createdAt)}
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full ring-1 ring-inset text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} ring-current/20`}>
          {cfg.label}
        </div>
      </div>

      {/* Body / Items */}
      <div className="space-y-1 mb-4 flex-1">
        {order.items.slice(0, 3).map(item => (
          <div key={item.id} className="flex items-start gap-2 text-xs">
            <span className="font-semibold text-muted-foreground">{item.quantity}x</span>
            <span className="text-foreground line-clamp-1">{item.product.name}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-[10px] font-medium text-muted-foreground pt-1">
            + {order.items.length - 3} more items
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">In Status</span>
          <span className="text-xs font-semibold text-foreground tracking-tight">{getTimeInStatus(order)}</span>
        </div>
        
        {/* Manual Movement Arrows (only if not dragging overlay and handler provided) */}
        {!isDragging && onStatusChange && (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            {prev && (
               <button 
                 onClick={() => onStatusChange(order.id, prev)}
                 type="button"
                 title={`Move to ${STATUS_CONFIG[prev].label}`}
                 className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
               >
                 <ArrowIcon direction="left" />
               </button>
            )}
            {next && (
               <button 
                 onClick={() => onStatusChange(order.id, next)}
                 type="button"
                 title={`Move to ${STATUS_CONFIG[next].label}`}
                 className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                   next === 'COMPLETED' ? 'bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50' :
                   'hover:bg-muted text-muted-foreground hover:text-foreground'
                 }`}
               >
                 <ArrowIcon direction="right" />
               </button>
            )}
          </div>
        )}
      </div>

      {/* Corner Status Accent */}
      <div className={`absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr-xl`}>
         <div className={`absolute top-[-10px] right-[-10px] w-6 h-6 rotate-45 ${cfg.dot} opacity-20`} />
      </div>
    </div>
  )
}

// ─── Droppable Column Component ────────────────────────────────────────────────

function KanbanColumn({ 
  status, 
  title, 
  orders, 
  onStatusChange,
  updatingId
}: { 
  status: OrderStatus
  title: string
  orders: Order[]
  onStatusChange: (id: string, newStatus: OrderStatus) => void
  updatingId: string | null
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status }
  })

  const cfg = STATUS_CONFIG[status]

  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col h-full min-h-[500px] rounded-2xl border transition-colors duration-200 ${
        isOver ? 'bg-muted/30 border-primary/30 ring-1 ring-primary/20' : 'bg-muted/10 border-border/60'
      }`}
    >
      <div className={`px-4 py-3.5 border-b border-border/40 rounded-t-2xl flex items-center justify-between ${cfg.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <h3 className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
            {title}
          </h3>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-background ring-1 ring-border text-[10px] font-bold text-muted-foreground">
          {orders.length}
        </div>
      </div>
      
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="h-24 flex items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground font-medium opacity-60">
            Empty
          </div>
        ) : (
          orders.map(order => (
            <KanbanCard 
              key={order.id} 
              order={order} 
              onStatusChange={onStatusChange}
              isUpdating={updatingId === order.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main Board Component ──────────────────────────────────────────────────────

const COLUMNS: { status: OrderStatus; title: string }[] = [
  { status: 'PENDING',    title: 'Pending' },
  { status: 'PROCESSING', title: 'Processing' },
  { status: 'READY',      title: 'Ready for Pickup' },
]

export function OrderMonitorBoard({ initialOrders, stores, currentUserId }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState<string>('all')
  const [activeDragData, setActiveDragData] = useState<Order | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { playChime, isMuted, setIsMuted, volume, setVolume } = useNotificationSound()

  // Keep track of pending IDs to detect purely *new* orders (for audio notification)
  const prevPendingIds = useRef<Set<string>>(
    new Set(initialOrders.filter(o => o.orderStatus === 'PENDING').map(o => o.id))
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // minimum drag distance before identifying as drag
      },
    })
  )

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [router])

  // Sync when server data changes and trigger sound if new orders arrived
  useEffect(() => {
    // 1. Detect new pending orders
    const currentPending = initialOrders.filter(o => o.orderStatus === 'PENDING')
    const currentPendingIds = new Set(currentPending.map(o => o.id))
    
    let hasNewOrder = false
    for (const id of currentPendingIds) {
      if (!prevPendingIds.current.has(id)) {
        hasNewOrder = true
        break
      }
    }

    // 2. Play sound if needed
    if (hasNewOrder) {
      playChime()
    }

    // 3. Update references and local state
    prevPendingIds.current = currentPendingIds
    setOrders(initialOrders)
  }, [initialOrders, playChime])

  const handleStatusChange = useCallback((orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    setUpdatingId(orderId)
    
    startTransition(async () => {
      const fd = new FormData()
      fd.set('transactionId', orderId)
      fd.set('status', newStatus)
      const result = await updateOrderStatus(fd)
      
      if (!result.success) {
        // Revert on failure
        setOrders(initialOrders)
        alert(result.error)
      }
      setUpdatingId(null)
      router.refresh()
    })
  }, [initialOrders, router])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveDragData(active.data.current?.order as Order)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null)
    const { active, over } = event
    
    if (!over) return

    const orderId = active.id as string
    const currentStatus = active.data.current?.order.orderStatus as OrderStatus
    const newStatus = over.id as OrderStatus

    if (currentStatus !== newStatus) {
      handleStatusChange(orderId, newStatus)
    }
  }

  const filteredOrders = storeFilter === 'all'
    ? orders
    : orders.filter(o => o.store?.id === storeFilter)

  const activeCount = filteredOrders.length
  
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            <span className="text-sm font-bold text-foreground">Live Operation Board</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-xs font-semibold text-muted-foreground hidden sm:block">
            {activeCount} active orders
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="group flex items-center relative h-8 rounded-lg outline-none transition-colors border bg-transparent border-border hover:border-teal-200 dark:hover:border-teal-500/20 hover:bg-teal-50 dark:hover:bg-teal-500/10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center justify-center w-8 h-full rounded-l-lg transition-colors ${
                isMuted 
                  ? 'text-muted-foreground' 
                  : 'text-teal-600 dark:text-teal-400'
              }`}
              title={isMuted ? 'Enable Audio Alerts (Muted)' : 'Mute Audio Alerts'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300 ease-out flex items-center pr-2">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  if (isMuted && parseFloat(e.target.value) > 0) setIsMuted(false)
                }}
                className="w-full h-1 bg-muted rounded-full cursor-pointer accent-teal-600 dark:accent-teal-400"
                title="Tone Volume"
              />
            </div>
          </div>
          
          {stores.length > 1 && (
            <select
              value={storeFilter}
              onChange={e => setStoreFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-background border border-border text-foreground hover:border-foreground/20 transition-colors outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Stores</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
              <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10.5 1.5V4.5H7.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sync
          </button>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {COLUMNS.map(col => (
            <KanbanColumn 
              key={col.status}
              status={col.status} 
              title={col.title} 
              orders={filteredOrders.filter(o => o.orderStatus === col.status)}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
            />
          ))}
        </div>

        {/* Floating Overlay when dragging */}
        <DragOverlay>
          {activeDragData ? (
             <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
                <KanbanCard order={activeDragData} />
             </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round"/>
               <path d="M3 9H21M9 21V9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-sm font-bold text-foreground">Board is completely clear</h3>
          <p className="text-xs text-muted-foreground max-w-[250px] mt-1.5 leading-relaxed">
            There are no active orders. As soon as a cashier completes a transaction, it will appear here instantly.
          </p>
        </div>
      )}
    </div>
  )
}
