/**
 * POS Layout — escapes the dashboard's p-6 main padding.
 * The sidebar is hidden client-side by POSClient's useEffect.
 * This wrapper ensures the POS fills the entire remaining viewport height.
 */
export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] overflow-hidden">
      {children}
    </div>
  )
}
