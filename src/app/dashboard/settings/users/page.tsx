import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { UserManager } from './components/UserManager'

export const metadata: Metadata = { title: 'Users' }

export default async function UsersPage() {
  const session = await verifySession()
  // Only OWNER and ADMIN can view user management
  if (session.role === 'CASHIER') redirect('/403')

  const users = await prisma.user.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, username: true, role: true, createdAt: true,
    },
  })

  return (
    <div className="animate-fade-in space-y-6 w-full">
      <div className="page-header flex-col items-start gap-1">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system access for {users.length} team members.</p>
      </div>
      <UserManager users={users} currentUserId={session.userId} />
    </div>
  )
}
