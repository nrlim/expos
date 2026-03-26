'use server'

import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  parentId: z.string().optional().nullable(),
})

export async function createCategory(formData: FormData) {
  const session = await verifySession()
  const name = formData.get('name')
  const parentId = (formData.get('parentId') as string) || null

  const parsed = CategorySchema.safeParse({ name, parentId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.name?.[0] || 'Invalid input' }
  }

  const { name: catName, parentId: catParentId } = parsed.data

  try {
    // @ts-ignore
    const existing = await prisma.category.findFirst({
      where: {
        name: catName,
        tenantId: session.tenantId,
        parentId: catParentId ?? null,
      }
    })

    if (existing) {
      return { success: false, error: 'A category with this name already exists at this level.' }
    }

    // If parentId given, verify it belongs to this tenant
    if (catParentId) {
      const parent = await prisma.category.findFirst({
        where: { id: catParentId, tenantId: session.tenantId }
      })
      if (!parent) {
        return { success: false, error: 'Parent category not found.' }
      }
    }

    // @ts-ignore
    await prisma.category.create({
      data: {
        name: catName,
        tenantId: session.tenantId,
        parentId: catParentId ?? null,
      }
    })

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to create category.' }
  }
}

export async function deleteCategory(id: string) {
  const session = await verifySession()

  try {
    // Get image info first for cleanup
    const target = await prisma.category.findFirst({
      where: { id, tenantId: session.tenantId },
      select: { imageUrl: true }
    })

    if (!target) return { success: false, error: 'Category not found.' }

    await prisma.category.delete({
      where: { id, tenantId: session.tenantId }
    })

    // Clean up file
    if (target.imageUrl) {
      const filePath = path.join(process.cwd(), 'public', target.imageUrl)
      if (filePath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
        await fs.unlink(filePath).catch(() => {}) // Ignore if file doesn't exist
      }
    }

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete category.' }
  }
}

export async function updateCategory(id: string, name: string) {
  const session = await verifySession()

  const parsed = z.string().min(1).trim().safeParse(name)
  if (!parsed.success) {
    return { success: false, error: 'Category name is required.' }
  }

  const trimmed = parsed.data

  try {
    // Find the target to get its parentId level for uniqueness check
    const target = await prisma.category.findFirst({
      where: { id, tenantId: session.tenantId }
    })
    if (!target) return { success: false, error: 'Category not found.' }

    // Check name collision at same level (same tenant + same parentId)
    // @ts-ignore
    const collision = await prisma.category.findFirst({
      where: {
        name: trimmed,
        tenantId: session.tenantId,
        parentId: (target as any).parentId ?? null,
        NOT: { id },
      }
    })
    if (collision) {
      return { success: false, error: 'Another category with this name already exists at this level.' }
    }

    await prisma.category.update({
      where: { id },
      data: { name: trimmed },
    })

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products/new')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update category.' }
  }
}

export async function uploadCategoryImage(id: string, formData: FormData) {
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

  // Verify the category belongs to this tenant
  const cat = await prisma.category.findFirst({
    where: { id, tenantId: session.tenantId }
  })
  if (!cat) return { success: false, error: 'Category not found.' }

  // Secure path: public/uploads/[tenantId]/categories/[catId].[ext]
  const ext = path.extname(file.name) || '.png'
  const filename = `${id}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.tenantId, 'categories')

  // Path traversal guard
  if (!uploadDir.startsWith(process.cwd())) {
    return { success: false, error: 'Invalid path.' }
  }

  try {
    await fs.mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadDir, filename), buffer)

    const imageUrl = `/uploads/${session.tenantId}/categories/${filename}`

    // @ts-ignore
    await prisma.category.update({
      where: { id },
      data: { imageUrl },
    })

    revalidatePath('/dashboard/categories')
    return { success: true, imageUrl }
  } catch {
    return { success: false, error: 'Failed to save image.' }
  }
}
