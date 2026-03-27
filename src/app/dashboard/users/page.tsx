import type { Metadata } from 'next'
import { verifySession, getTenantPlan } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { UserManager } from './components/UserManager'
import { PLAN_CONFIG } from '@/lib/plans'

export const metadata: Metadata = { title: 'Users' }

export default async function UsersPage() {
  const session = await verifySession()
  if (session.role === 'CASHIER') redirect('/403')

  const [users, customRoles, plan] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, username: true, role: true, customRoleId: true, createdAt: true,
      },
    }),
    prisma.customRole.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
    }),
    getTenantPlan(session.tenantId),
  ])

  const maxUsers = PLAN_CONFIG[plan].maxUsers

  return (
    <div className="animate-fade-in space-y-6 w-full">
      <div className="page-header flex-col items-start gap-1">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system access for {users.length} team members.</p>
      </div>
      <UserManager users={users} currentUserId={session.userId} customRoles={customRoles} plan={plan} maxUsers={maxUsers} />
    </div>
  )
}
