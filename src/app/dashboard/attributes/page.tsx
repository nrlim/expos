import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { AttributeManager } from './components/AttributeManager'

export const metadata = {
  title: 'Variant Attributes - Master Data',
}

export default async function AttributesPage() {
  const session = await verifySession()

  // @ts-ignore
  const attributes = await prisma.attribute.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      values: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  return (
    <div className="space-y-6 w-full py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attributes</h1>
        <p className="text-sm text-muted-foreground">Manage product variant attributes like Color, Size, Storage Capacity, etc.</p>
      </div>
      <AttributeManager attributes={attributes} />
    </div>
  )
}
