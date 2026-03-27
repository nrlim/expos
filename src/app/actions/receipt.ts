'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ReceiptConfigSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  logoUrl: z.string().optional().nullable(),
  storeName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  footerMessage: z.string().optional().nullable(),
  socialHandles: z.string().optional().nullable(),
  autoPrint: z.boolean().default(false),
  paperWidth: z.number().default(58),
})

export async function getReceiptConfig(storeId: string) {
  try {
    const session = await verifySession()
    
    // Check if store belongs to tenant
    const store = await prisma.store.findFirst({
      where: { id: storeId, tenantId: session.tenantId }
    })
    
    if (!store) {
      return { success: false, error: 'Store not found or access denied.' }
    }

    const config = await prisma.receiptConfig.findUnique({
      where: { storeId },
    })

    if (!config) {
      return { success: true, data: null }
    }
    
    return { success: true, data: config }
  } catch (error) {
    console.error('Error fetching receipt config:', error)
    return { success: false, error: 'Failed to fetch receipt config' }
  }
}

export async function saveReceiptConfig(formData: FormData) {
  try {
    const session = await verifySession()
    if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to configure receipts' }
    }

    const rawData = {
      storeId: formData.get('storeId') as string,
      logoUrl: formData.get('logoUrl') as string | null,
      storeName: formData.get('storeName') as string | null,
      address: formData.get('address') as string | null,
      phoneNumber: formData.get('phoneNumber') as string | null,
      footerMessage: formData.get('footerMessage') as string | null,
      socialHandles: formData.get('socialHandles') as string | null,
      autoPrint: formData.get('autoPrint') === 'true',
      paperWidth: parseInt(formData.get('paperWidth') as string || '58', 10),
    }

    const parsed = ReceiptConfigSchema.safeParse(rawData)

    if (!parsed.success) {
      return { success: false, error: 'Invalid configuration data' }
    }

    const validData = parsed.data

    // Check store ownership
    const store = await prisma.store.findFirst({
      where: { id: validData.storeId, tenantId: session.tenantId }
    })

    if (!store) {
      return { success: false, error: 'Invalid store selected' }
    }

    const config = await prisma.receiptConfig.upsert({
      where: { storeId: validData.storeId },
      update: {
        logoUrl: validData.logoUrl,
        storeName: validData.storeName,
        address: validData.address,
        phoneNumber: validData.phoneNumber,
        footerMessage: validData.footerMessage,
        socialHandles: validData.socialHandles,
        autoPrint: validData.autoPrint,
        paperWidth: validData.paperWidth,
      },
      create: {
        storeId: validData.storeId,
        tenantId: session.tenantId,
        logoUrl: validData.logoUrl,
        storeName: validData.storeName,
        address: validData.address,
        phoneNumber: validData.phoneNumber,
        footerMessage: validData.footerMessage,
        socialHandles: validData.socialHandles,
        autoPrint: validData.autoPrint,
        paperWidth: validData.paperWidth,
      }
    })

    revalidatePath('/dashboard/settings/receipts')
    revalidatePath('/dashboard/pos')
    return { success: true, data: config }
  } catch (error) {
    console.error('Failed to save receipt config:', error)
    return { success: false, error: 'Failed to save receipt configuration' }
  }
}
