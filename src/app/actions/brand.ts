'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { promises as fs } from 'fs'
import path from 'path'

const BrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').trim(),
})

export async function createBrand(formData: FormData) {
  const session = await verifySession()
  const name = formData.get('name')

  const parsed = BrandSchema.safeParse({ name })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.name?.[0] || 'Invalid input' }
  }

  const { name: brandName } = parsed.data

  try {
    // @ts-ignore
    const existing = await prisma.brand.findFirst({
      where: {
        name: brandName,
        tenantId: session.tenantId,
      }
    })

    if (existing) {
      return { success: false, error: 'A brand with this name already exists.' }
    }

    // @ts-ignore
    await prisma.brand.create({
      data: {
        name: brandName,
        tenantId: session.tenantId,
      }
    })

    revalidatePath('/dashboard/brands')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create brand.' }
  }
}

export async function deleteBrand(id: string) {
  const session = await verifySession()

  try {
    // Get image info first for cleanup
    // @ts-ignore
    const target = await prisma.brand.findFirst({
      where: { id, tenantId: session.tenantId },
      select: { imageUrl: true }
    })

    if (!target) return { success: false, error: 'Brand not found.' }

    // @ts-ignore
    await prisma.brand.delete({
      where: { id, tenantId: session.tenantId }
    })

    // Clean up file
    if (target.imageUrl) {
      const filePath = path.join(process.cwd(), 'public', target.imageUrl)
      if (filePath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
        await fs.unlink(filePath).catch(() => {}) // Ignore if file doesn't exist
      }
    }

    revalidatePath('/dashboard/brands')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete brand.' }
  }
}

export async function updateBrand(id: string, name: string) {
  const session = await verifySession()

  const parsed = z.string().min(1).trim().safeParse(name)
  if (!parsed.success) {
    return { success: false, error: 'Brand name is required.' }
  }

  const trimmed = parsed.data

  try {
    // @ts-ignore
    const target = await prisma.brand.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!target) return { success: false, error: 'Brand not found.' }

    // @ts-ignore
    const collision = await prisma.brand.findFirst({
      where: {
        name: trimmed,
        tenantId: session.tenantId,
        NOT: { id },
      }
    })
    if (collision) {
      return { success: false, error: 'Another brand with this name already exists.' }
    }

    // @ts-ignore
    await prisma.brand.update({
      where: { id },
      data: { name: trimmed },
    })

    revalidatePath('/dashboard/brands')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update brand.' }
  }
}

export async function uploadBrandImage(id: string, formData: FormData) {
  const session = await verifySession()

  const file = formData.get('image') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided.' }
  }
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'File must be an image.' }
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'Image must be under 2MB.' }
  }

  // @ts-ignore
  const brand = await prisma.brand.findFirst({
    where: { id, tenantId: session.tenantId }
  })
  if (!brand) return { success: false, error: 'Brand not found.' }

  const ext = path.extname(file.name) || '.png'
  const filename = `${id}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.tenantId, 'brands')

  if (!uploadDir.startsWith(process.cwd())) {
    return { success: false, error: 'Invalid path.' }
  }

  try {
    await fs.mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadDir, filename), buffer)

    const imageUrl = `/uploads/${session.tenantId}/brands/${filename}`

    // @ts-ignore
    await prisma.brand.update({
      where: { id },
      data: { imageUrl },
    })

    revalidatePath('/dashboard/brands')
    return { success: true, imageUrl }
  } catch {
    return { success: false, error: 'Failed to save image.' }
  }
}
