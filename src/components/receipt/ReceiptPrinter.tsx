'use client'

import { useEffect, useRef } from 'react'

export interface ReceiptData {
  transactionId: string
  cashierName: string
  date: string
  time: string
  items: Array<{ name: string; qty: number; price: number; total: number }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
}

export interface ReceiptConfigData {
  logoUrl?: string | null
  storeName?: string | null
  address?: string | null
  phoneNumber?: string | null
  footerMessage?: string | null
  socialHandles?: string | null
  paperWidth: number
  autoPrint: boolean
}

interface Props {
  data: ReceiptData | null
  config: ReceiptConfigData | null
  onClose: () => void
}

export function ReceiptPrinter({ data, config, onClose }: Props) {
  const printTriggered = useRef(false)

  useEffect(() => {
    if (data && config && !printTriggered.current) {
      if (config.autoPrint) {
        // slight delay to let the DOM render before printing
        setTimeout(() => {
          window.print()
          onClose()
        }, 500)
        printTriggered.current = true
      }
    }
  }, [data, config, onClose])

  if (!data || !config) return null

  // Variables parsing
  const parseVariables = (text?: string | null) => {
    if (!text) return ''
    return text
      .replace(/{{transaction_id}}/g, data.transactionId)
      .replace(/{{cashier_name}}/g, data.cashierName)
      .replace(/{{date}}/g, data.date)
      .replace(/{{time}}/g, data.time)
  }

  return (
    <div id="thermal-receipt" className={`hidden print:block text-black bg-white t-receipt w-full overflow-hidden ${config.paperWidth === 58 ? 'max-w-[58mm]' : 'max-w-[80mm]'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 0; /* Remove headers/footers */
            size: ${config.paperWidth === 58 ? '58mm auto' : '80mm auto'};
          }
        }
        .t-receipt {
          font-family: ui-monospace, Consolas, Monaco, "Courier New", monospace;
          font-size: 11px;
          line-height: 1.3;
        }
        .t-receipt table { width: 100%; border-collapse: collapse; }
        .t-receipt th, .t-receipt td { padding: 2px 0; }
        .flex-bw { display: flex; justify-content: space-between; }
      `}} />
      
      {/* Header */}
      <div className="text-center mb-4">
        {config.logoUrl && (
          <img 
            src={config.logoUrl} 
            alt="Logo" 
            className="max-h-16 mx-auto mb-2 mix-blend-multiply contrast-125 grayscale" 
          />
        )}
        <div className="font-bold text-sm uppercase tracking-tight">{config.storeName || 'STORE NAME'}</div>
        {config.address && <div className="whitespace-pre-wrap mt-1">{config.address}</div>}
        {config.phoneNumber && <div>Tel: {config.phoneNumber}</div>}
      </div>

      {/* Meta */}
      <div className="border-t border-b border-black/50 border-dashed py-2 mb-2">
        <div className="flex-bw"><span>Date:</span> <span>{data.date} {data.time}</span></div>
        <div className="flex-bw"><span>Cashier:</span> <span>{data.cashierName}</span></div>
        <div className="flex-bw"><span>Trx ID:</span> <span>{data.transactionId}</span></div>
      </div>

      {/* Items */}
      <div className="mb-2">
        <table className="text-left table-fixed w-full">
          <thead>
            <tr className="border-b border-black/50 border-dashed">
              <th className="font-normal w-[50%]">Item</th>
              <th className="font-normal w-[15%] text-right">Qty</th>
              <th className="font-normal w-[35%] text-right">Total</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {data.items.map((it, idx) => (
              <tr key={idx}>
                <td className="pr-1 break-words">{it.name}</td>
                <td className="text-right">{it.qty}</td>
                <td className="text-right">{it.total.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="border-t border-black/50 border-dashed pt-2 font-bold mb-4">
        {data.tax > 0 && <div className="flex-bw font-normal"><span>Tax</span><span>{data.tax.toLocaleString('id-ID')}</span></div>}
        {data.discount > 0 && <div className="flex-bw font-normal"><span>Discount</span><span>-{data.discount.toLocaleString('id-ID')}</span></div>}
        <div className="flex-bw font-normal"><span>Subtotal</span><span>{data.subtotal.toLocaleString('id-ID')}</span></div>
        <div className="flex-bw text-sm mt-1 border-t border-black/30 pt-1"><span>TOTAL</span><span>Rp {data.total.toLocaleString('id-ID')}</span></div>
        <div className="flex-bw font-normal mt-1"><span>{data.paymentMethod}</span><span>{data.total.toLocaleString('id-ID')}</span></div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] mt-4 pt-2 border-t border-black/50 border-dashed">
        {config.footerMessage && (
          <div className="whitespace-pre-wrap mb-1">{parseVariables(config.footerMessage)}</div>
        )}
        {config.socialHandles && (
          <div className="whitespace-pre-wrap font-semibold">{parseVariables(config.socialHandles)}</div>
        )}
      </div>

      {/* Cut gap */}
      <div className="h-8"></div>
    </div>
  )
}
