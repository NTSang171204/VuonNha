import { PrismaClient, Role, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farm.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@farm.com',
      password: '$2b$10$placeholderhash', // TODO: Replace with real bcrypt hash
      phoneNumber: '0123456789',
      role: Role.ADMIN,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create categories
  const categories = await Promise.all(
    ['Rau củ', 'Trái cây', 'Thịt & Trứng', 'Gia vị'].map((name) =>
      prisma.category.upsert({
        where: { id: name.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: { id: name.toLowerCase().replace(/\s+/g, '-'), name },
      }),
    ),
  );
  console.log('Created categories:', categories.map((c) => c.name).join(', '));

  // Create sample products
  const products = [
    { name: 'Cà chua', price: 15000, unit: 'kg', categoryId: categories[0].id, stock: 100 },
    { name: 'Xà lách', price: 12000, unit: 'bó', categoryId: categories[0].id, stock: 50 },
    { name: 'Cam sành', price: 25000, unit: 'kg', categoryId: categories[1].id, stock: 200 },
    { name: 'Xoài cát', price: 35000, unit: 'kg', categoryId: categories[1].id, stock: 80 },
    { name: 'Thịt heo', price: 120000, unit: 'kg', categoryId: categories[2].id, stock: 30 },
    { name: 'Trứng gà', price: 3000, unit: 'quả', categoryId: categories[2].id, stock: 500 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: product.name.toLowerCase().replace(/\s+/g, '-'),
        ...product,
        status: ProductStatus.ACTIVE,
        imageUrl: `https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`,
      },
    });
  }
  console.log('Created products:', products.length);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
