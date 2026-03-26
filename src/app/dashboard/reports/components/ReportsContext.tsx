'use client'

import { createContext, useContext } from 'react'
import type { DateRange } from '../types'

interface ReportsContextValue {
  qs: string
  dateRange: DateRange
  selectedStore: string
}

export const ReportsContext = createContext<ReportsContextValue>({
  qs: '',
  dateRange: { from: '', to: '', label: '' },
  selectedStore: '',
})

export function useReportsContext() {
  return useContext(ReportsContext)
}
