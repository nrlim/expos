'use client'

import React from 'react'

export interface Column<T> {
  key: string
  header: string
  /** If true, this column is hidden on mobile (shows only in table view) */
  mobileHidden?: boolean
  /** If true, this is a primary field shown prominently in card view */
  cardPrimary?: boolean
  /** If true, shown as secondary line in card view */
  cardSecondary?: boolean
  /** Custom render function */
  render?: (row: T) => React.ReactNode
  /** Alignment — default left */
  align?: 'left' | 'right' | 'center'
}

interface ResponsiveTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  /** Extra class applied to the table wrapper */
  className?: string
  /** Callback for row click */
  onRowClick?: (row: T) => void
  /** Render a custom card body (replaces default card layout if provided) */
  renderCard?: (row: T) => React.ReactNode
  /** Render row actions */
  renderActions?: (row: T) => React.ReactNode
  /** Empty state content */
  emptyState?: React.ReactNode
  /** Selection — set of selected IDs */
  selectedIds?: Set<string>
  onToggleAll?: () => void
  onToggleOne?: (id: string) => void
}

/**
 * ResponsiveTable
 *
 * Desktop (sm+): Renders a full HTML table with `data-table` class.
 * Mobile (< sm): Renders a scrollable list of card-style divs.
 *
 * Columns with `mobileHidden: true` appear only in the desktop table.
 * Columns with `cardPrimary: true` render as the card title.
 * Columns with `cardSecondary: true` render as the card subtitle.
 */
export function ResponsiveTable<T extends { id: string }>({
  columns,
  data,
  className = '',
  onRowClick,
  renderCard,
  renderActions,
  emptyState,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: ResponsiveTableProps<T>) {
  const hasSelection = !!selectedIds && !!onToggleOne

  if (data.length === 0) {
    return (
      <div className={`card ${className}`}>
        {emptyState ?? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <svg className="w-10 h-10 mb-3 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-semibold text-foreground">No data found</p>
            <p className="text-xs text-muted-foreground mt-1">Adjust your filters or add new entries.</p>
          </div>
        )}
      </div>
    )
  }

  const primaryCol = columns.find((c) => c.cardPrimary)
  const secondaryCol = columns.find((c) => c.cardSecondary)
  const bodyColsMobile = columns.filter((c) => !c.mobileHidden && !c.cardPrimary && !c.cardSecondary)

  return (
    <>
      {/* ─── MOBILE CARD LIST ─── */}
      <div className={`sm:hidden space-y-2 ${className}`}>
        {data.map((row) => {
          const isSelected = selectedIds?.has(row.id)
          return (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`card p-3.5 flex flex-col gap-2.5 transition-colors ${
                isSelected ? 'border-primary/50 bg-primary/5' : ''
              } ${onRowClick ? 'cursor-pointer hover:border-border' : ''}`}
            >
              {renderCard ? (
                renderCard(row)
              ) : (
                <>
                  {/* Card header row */}
                  <div className="flex items-start gap-3">
                    {hasSelection && (
                      <input
                        type="checkbox"
                        className="accent-primary cursor-pointer w-4 h-4 mt-0.5 shrink-0"
                        checked={isSelected}
                        onChange={() => onToggleOne!(row.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {primaryCol && (
                        <div className="font-semibold text-sm text-foreground leading-tight truncate">
                          {primaryCol.render ? primaryCol.render(row) : (row as any)[primaryCol.key]}
                        </div>
                      )}
                      {secondaryCol && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {secondaryCol.render ? secondaryCol.render(row) : (row as any)[secondaryCol.key]}
                        </div>
                      )}
                    </div>
                    {renderActions && (
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        {renderActions(row)}
                      </div>
                    )}
                  </div>

                  {/* Body fields as key-value pills */}
                  {bodyColsMobile.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                      {bodyColsMobile.map((col) => (
                        <div key={col.key} className="flex items-center gap-1.5">
                          <span className="text-muted-foreground font-medium shrink-0">{col.header}:</span>
                          <span className="text-foreground">
                            {col.render ? col.render(row) : (row as any)[col.key] ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ─── DESKTOP TABLE ─── */}
      <div className={`hidden sm:block card overflow-x-auto ${className}`}>
        <table className="data-table">
          <thead>
            <tr>
              {hasSelection && (
                <th className="w-8">
                  <input
                    type="checkbox"
                    className="accent-primary cursor-pointer w-4 h-4"
                    checked={selectedIds!.size > 0 && selectedIds!.size === data.length}
                    onChange={onToggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.mobileHidden ? 'hidden md:table-cell' : ''} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
              {renderActions && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isSelected = selectedIds?.has(row.id)
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`${isSelected ? 'bg-primary/5' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {hasSelection && (
                    <td>
                      <input
                        type="checkbox"
                        className="accent-primary cursor-pointer w-4 h-4"
                        checked={isSelected}
                        onChange={() => onToggleOne!(row.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.mobileHidden ? 'hidden md:table-cell' : ''} ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {col.render ? col.render(row) : ((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
