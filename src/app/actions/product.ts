'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const ProductSchema = z.object({
  name: z.string().min(2, 'Name is required').trim(),
  description: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  modelName: z.string().min(1, 'Model name is required').trim(),
  sku: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  costPrice: z.coerce.number().nullable().optional(),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair']),
  categoryId: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  batteryHealth: z.coerce.number().min(0).max(100).nullable().optional(),
  warrantyId: z.string().optional().nullable(),
})

export async function createProduct(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession()

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description') || null,
    brandId: formData.get('brandId') || null,
    modelName: formData.get('modelName'),
    sku: formData.get('sku') || null,
    storage: formData.get('storage') || null,
    price: formData.get('price'),
    costPrice: formData.get('costPrice') || null,
    condition: formData.get('condition'),
    categoryId: formData.get('categoryId') || null,
    unitId: formData.get('unitId') || null,
    batteryHealth: formData.get('batteryHealth') || null,
    warrantyId: formData.get('warrantyId') || null,
  }

  const parsed = ProductSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors in the form.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { data } = parsed
  const imageFile = formData.get('image') as File | null

  // Determine store assignments
  const storeIds = formData.getAll('storeIds') as string[]
  const inventoriesData = storeIds.map((storeId) => {
    const stockRaw = formData.get(`stock_${storeId}`)
    const priceRaw = formData.get(`price_${storeId}`)
    const stock = stockRaw ? parseInt(stockRaw as string, 10) : 0
    const storePrice = (priceRaw && (priceRaw as string).trim() !== '') 
      ? parseInt(priceRaw as string, 10) 
      : null

    return {
      storeId,
      stock,
      price: storePrice,
      status: stock > 0 ? 'AVAILABLE' : 'SOLD'
    }
  })

  // Start Transaction or create directly
  // @ts-ignore
  const newProduct = await prisma.product.create({
    data: {
      ...data,
      categoryId: data.categoryId,
      imageUrl: null, // we'll update it after knowing product id, but prompt says public/uploads/[tenantId]/products/[productId].jpg. We can use `newProduct.id`.
      tenantId: session.tenantId,
      // @ts-ignore
      inventories: {
        create: inventoriesData.map(inv => ({
          storeId: inv.storeId,
          stock: inv.stock,
          price: inv.price,
          status: inv.status as 'AVAILABLE' | 'SOLD' | 'BOOKED'
        }))
      }
    },
  })

  // If there's an image, we rename/save it to [productId].jpg (per instructions: public/uploads/[tenantId]/products/[productId].jpg)
  if (imageFile && imageFile.size > 0) {
    const tenantDirName = session.tenantId
    const ext = path.extname(imageFile.name) || '.jpg'
    
    // As explicitly requested: public/uploads/[tenantId]/products/[productId].jpg
    // But we use the product ID for the name instead of random crypto to follow: "public/uploads/[tenantId]/products/[productId].jpg"
    const finalFilename = `${newProduct.id}.jpg` // Coercing to JPG to exactly match prompt "products/[productId].jpg", though keeping original ext could be better.
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', tenantDirName, 'products')
    
    if (uploadDir.startsWith(process.cwd())) {
      try {
        await fs.mkdir(uploadDir, { recursive: true })
        const buffer = Buffer.from(await imageFile.arrayBuffer())
        const writePath = path.join(uploadDir, finalFilename)
        await fs.writeFile(writePath, buffer)

        // Update the row with the actual imageUrl
        await prisma.product.update({
          where: { id: newProduct.id },
          data: { imageUrl: `/uploads/${tenantDirName}/products/${finalFilename}` }
        })
      } catch {
        // Non-fatal, product created but without image. Could rollback, but returning as is since it's soft fail on image.
      }
    }
  }

  // Save attribute values
  const attributeIds = formData.getAll('attributeIds') as string[]
  const attrRows = attributeIds
    .map(attrId => {
      const valueId = formData.get(`attr_${attrId}`) as string | null
      if (!valueId) return null
      return { productId: newProduct.id, attributeId: attrId, attributeValueId: valueId }
    })
    .filter(Boolean) as { productId: string; attributeId: string; attributeValueId: string }[]
  if (attrRows.length > 0) {
    // @ts-ignore
    await prisma.productAttributeValue.createMany({ data: attrRows })
  }

  redirect('/dashboard/products')
}

export async function updateProduct(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession()

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description') || null,
    brandId: formData.get('brandId') || null,
    modelName: formData.get('modelName'),
    sku: formData.get('sku') || null,
    storage: formData.get('storage') || null,
    price: formData.get('price'),
    costPrice: formData.get('costPrice') || null,
    condition: formData.get('condition'),
    categoryId: formData.get('categoryId') || null,
    unitId: formData.get('unitId') || null,
    batteryHealth: formData.get('batteryHealth') || null,
    warrantyId: formData.get('warrantyId') || null,
    isFullset: formData.get('isFullset') === 'true',
  }

  const parsed = ProductSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors in the form.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { data } = parsed
  const imageFile = formData.get('image') as File | null

  // Determine store assignments
  const storeIds = formData.getAll('storeIds') as string[]
  const inventoriesData = storeIds.map((storeId) => {
    const stockRaw = formData.get(`stock_${storeId}`)
    const priceRaw = formData.get(`price_${storeId}`)
    const stock = stockRaw ? parseInt(stockRaw as string, 10) : 0
    const storePrice = (priceRaw && (priceRaw as string).trim() !== '') 
      ? parseInt(priceRaw as string, 10) 
      : null

    return {
      storeId,
      stock,
      price: storePrice,
      status: stock > 0 ? 'AVAILABLE' : 'SOLD'
    }
  })

  // Start Transaction to update product and replace old inventories
  await prisma.$transaction(async (tx) => {
    // @ts-ignore
    await tx.product.update({
      where: { id, tenantId: session.tenantId },
      data: {
        ...data,
        categoryId: data.categoryId,
      },
    })

    // Delete existing inventories for this product
    // @ts-ignore
    await tx.inventory.deleteMany({
      where: { productId: id }
    })

    // Recreate inventories
    if (inventoriesData.length > 0) {
      // @ts-ignore
      await tx.inventory.createMany({
        data: inventoriesData.map(inv => ({
          productId: id,
          storeId: inv.storeId,
          stock: inv.stock,
          price: inv.price,
          status: inv.status as 'AVAILABLE' | 'SOLD' | 'BOOKED'
        }))
      })
    }
  })

  // If there's an image, replace it
  if (imageFile && imageFile.size > 0) {
    const tenantDirName = session.tenantId
    const finalFilename = `${id}.jpg`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', tenantDirName, 'products')
    
    if (uploadDir.startsWith(process.cwd())) {
      try {
        await fs.mkdir(uploadDir, { recursive: true })
        const buffer = Buffer.from(await imageFile.arrayBuffer())
        const writePath = path.join(uploadDir, finalFilename)
        await fs.writeFile(writePath, buffer)

        // @ts-ignore
        await prisma.product.update({
          where: { id, tenantId: session.tenantId },
          data: { imageUrl: `/uploads/${tenantDirName}/products/${finalFilename}?v=${Date.now()}` }
        })
      } catch {
      }
    }
  }

  // Save attribute values — drop and recreate
  const attributeIds = formData.getAll('attributeIds') as string[]
  // @ts-ignore
  await prisma.productAttributeValue.deleteMany({ where: { productId: id } })
  const attrRows = attributeIds
    .map(attrId => {
      const valueId = formData.get(`attr_${attrId}`) as string | null
      if (!valueId) return null
      return { productId: id, attributeId: attrId, attributeValueId: valueId }
    })
    .filter(Boolean) as { productId: string; attributeId: string; attributeValueId: string }[]
  if (attrRows.length > 0) {
    // @ts-ignore
    await prisma.productAttributeValue.createMany({ data: attrRows })
  }

  redirect('/dashboard/products')
}

export async function deleteProduct(id: string) {
  const session = await verifySession()

  try {
    const product = await prisma.product.findFirst({
      where: { id, tenantId: session.tenantId },
      select: { imageUrl: true }
    })

    if (!product) return { success: false, error: 'Product not found.' }

    await prisma.product.delete({
      where: { id, tenantId: session.tenantId }
    })

    // Cleanup images
    if (product.imageUrl) {
      // Remove version query if exists
      const cleanPath = product.imageUrl.split('?')[0]
      const filePath = path.join(process.cwd(), 'public', cleanPath)
      if (filePath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
        await fs.unlink(filePath).catch(() => {})
      }
    }

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete product.' }
  }
}
