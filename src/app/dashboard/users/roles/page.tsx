import type { Metadata } from 'next'
import { verifySession, getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { RoleManager } from './components/RoleManager'
import { PagePlanGate } from '@/components/PagePlanGate'

export const AVAILABLE_PERMISSIONS = [
  { id: 'module:products', label: 'Manage Products' },
  { id: 'module:inventory', label: 'Manage Inventory' },
  { id: 'module:categories', label: 'Manage Categories' },
  { id: 'module:brands', label: 'Manage Brands' },
  { id: 'module:transactions', label: 'Manage Transactions' },
  { id: 'module:pos', label: 'Access POS Checkout' },
]

export const metadata: Metadata = { title: 'Roles & Permissions' }

export default async function RolesPage() {
  const session = await verifySession()

  if (session.role === 'CASHIER' || session.role === 'CUSTOM') {
    redirect('/dashboard/pos')
  }

  const [customRoles, plan] = await Promise.all([
    prisma.customRole.findMany({
      where: { tenantId: session.tenantId },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    getTenantPlan(session.tenantId),
  ])

  // Format array
  const formattedRoles = customRoles.map((r: any) => ({
    ...r,
    parsedPermissions: JSON.parse(r.permissions) as string[]
  }))

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="page-header mt-4 mb-6">
        <div>
          <h1 className="page-title text-2xl">Roles & Permissions</h1>
          <p className="page-subtitle text-sm">Create custom roles and assign module access permissions.</p>
        </div>
      </div>

      <PagePlanGate feature="multi_user" plan={plan}>
        <RoleManager customRoles={formattedRoles} permissionsList={AVAILABLE_PERMISSIONS} />
      </PagePlanGate>
    </div>
  )
}
