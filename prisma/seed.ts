// @ts-nocheck
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Wiping all data and starting fresh seeder with perfect UI icons...')

  // 1. Get or create Tenant & Store
  let tenant = await prisma.tenant.findFirst()
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: 'ex-POS Store', slug: 'ex-pos' } })
  }
  const tenantId = tenant.id

  let store = await prisma.store.findFirst({ where: { tenantId } })
  if (!store) {
    store = await prisma.store.create({ data: { name: 'Main Outlet', location: 'Jakarta', tenantId } })
  }
  const storeId = store.id

  console.log(`✅ Organization active: ${tenant.name} | Store: ${store.name}`)

  // 2. HARD RESET: Wipe everything to keep ONLY perfect demo data
  // Clean up all data belonging to this tenant
  await prisma.inventory.deleteMany({ where: { storeId } })
  await prisma.product.deleteMany({ where: { tenantId } })
  await prisma.category.deleteMany({ where: { tenantId } })
  await prisma.brand.deleteMany({ where: { tenantId } })
  await prisma.unit.deleteMany({ where: { tenantId } })
  await prisma.warranty.deleteMany({ where: { tenantId } })

  console.log('🗑️  Wiped all old messy master data.')

  // 3. Seed Brands with perfect icons
  const brandData = [
    { name: 'Apple', img: '/images/brands/brand-apple.png' },
    { name: 'Lenovo', img: '/images/brands/brand-lenovo.png' },
    { name: 'Rolex', img: '/images/brands/brand-rolex.png' },
    { name: 'Nike', img: '/images/brands/brand-nike.png' },
    { name: 'Beats', img: '/images/brands/brand-beats.svg' }, // our generated fallback
  ]
  const brandMap = new Map()
  for (const b of brandData) {
    const brand = await prisma.brand.create({
      data: { name: b.name, imageUrl: b.img, tenantId },
    })
    brandMap.set(b.name, brand.id)
  }
  console.log('✅ 5 Brands seeded with logos.')

  // 4. Seed Cat with images
  async function createCat(name: string, imgKey: string) {
    return prisma.category.create({
      data: { name, imageUrl: `/images/products/cat-${imgKey}.png`, tenantId }
    })
  }
  const catMobiles = await createCat('Mobiles', 'mobiles')
  const catLaptops = await createCat('Laptops', 'laptops')
  const catWatches = await createCat('Watches', 'watches')
  const catShoes = await createCat('Shoes', 'shoes')
  const catHeadsets = await createCat('Headsets', 'headsets')
  console.log('✅ 5 Categories seeded with icons.')

  // 5. Units & Warranties
  const unitPcs = await prisma.unit.create({ data: { name: 'Pieces', shortName: 'Pcs', tenantId } })
  const war1Y = await prisma.warranty.create({ data: { name: 'Official 1 Year', duration: 1, durationUnit: 'Years', tenantId } })

  // 6. Products matching screenshot
  const seedProducts = [
    {
      name: 'iPhone 14 64GB',
      modelName: 'A2882',
      sku: 'IP14-64-MID',
      price: 15800000,
      condition: 'New',
      brandName: 'Apple',
      categoryId: catMobiles.id,
      imgKey: 'prod-iphone.png',
    },
    {
      name: 'MacBook Pro',
      modelName: 'M2 Pro 2023',
      sku: 'MBP-M2-14',
      price: 25000000,
      condition: 'New',
      brandName: 'Apple',
      categoryId: catLaptops.id,
      imgKey: 'prod-macbook.png',
    },
    {
      name: 'Rolex Tribute V3',
      modelName: 'Submariner',
      sku: 'RLX-SUB-V3',
      price: 68000000,
      condition: 'New',
      brandName: 'Rolex',
      categoryId: catWatches.id,
      imgKey: 'prod-rolex.png',
    },
    {
      name: 'Red Nike Angelo',
      modelName: 'Air Max Angelo',
      sku: 'NKE-ANG-RD',
      price: 2500000,
      condition: 'New',
      brandName: 'Nike',
      categoryId: catShoes.id,
      imgKey: 'prod-redshoe.png',
    },
    {
      name: 'Airpods 2',
      modelName: 'A2032',
      sku: 'AP2-WHT',
      price: 1800000,
      condition: 'Like New',
      brandName: 'Apple',
      categoryId: catHeadsets.id,
      imgKey: 'prod-airpods.png',
    },
    {
      name: 'Blue White OGR',
      modelName: 'Sprint Retro',
      sku: 'NKE-OGR-BLU',
      price: 1500000,
      condition: 'New',
      brandName: 'Nike',
      categoryId: catShoes.id,
      imgKey: 'prod-blueshoe.png',
    },
    {
      name: 'IdeaPad Slim 5 Gen 7',
      modelName: '14IAL7',
      sku: 'LNV-IPS5-G7',
      price: 11000000,
      condition: 'New',
      brandName: 'Lenovo',
      categoryId: catLaptops.id,
      imgKey: 'prod-lenovo.png',
    },
    {
      name: 'SWAGME',
      modelName: 'Studio Pro',
      sku: 'SWG-PRO-BLK',
      price: 550000,
      condition: 'New',
      brandName: 'Beats',
      categoryId: catHeadsets.id,
      imgKey: 'prod-beats.png',
    },
  ]

  for (const p of seedProducts) {
    const imgPath = `/images/products/${p.imgKey}`

    const product = await prisma.product.create({
      data: {
        name: p.name,
        modelName: p.modelName,
        sku: p.sku,
        price: p.price,
        condition: p.condition,
        imageUrl: imgPath,
        images: JSON.stringify([imgPath]),
        brandId: brandMap.get(p.brandName),
        categoryId: p.categoryId,
        unitId: unitPcs.id,
        warrantyId: war1Y.id,
        tenantId,
      }
    })

    await prisma.inventory.create({
      data: {
        productId: product.id,
        storeId,
        stock: Math.floor(Math.random() * 20) + 5,
        price: p.price,
      }
    })
  }
  
  console.log('✅ Real AI-generated Products and Inventory seeded.')
  console.log('🎉 Completely clean and flawlessly seeded database! Refresh your interface.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
