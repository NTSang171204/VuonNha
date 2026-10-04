import { PrismaClient, Role, ProductStatus, Unit } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Chuyển đổi tên tiếng Việt có dấu thành slug không dấu
 * VD: "Rau Củ" → "rau-cu", "Đặc Sản Vùng Miền" → "dac-san-vung-mien"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
    .replace(/đ/g, 'd') // Chuyển đ → d
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Gộp nhiều dấu gạch ngang liên tiếp
    .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu/cuối
}

async function main() {
  console.log('Seeding database...');

  // Password: admin123 (bcrypt)
  const adminPassword =
    '$2a$10$rK38XiGMENk3Nko8qVK/MuXrnjb./RRf9dw/./Mikkk7UV5HANiKS';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@farm.com' },
    update: { password: adminPassword },
    create: {
      name: 'Admin',
      email: 'admin@farm.com',
      password: adminPassword,
      phoneNumber: '0123456789',
      role: Role.ADMIN,
    },
  });
  console.log('Created admin user:', admin.email, '(password: admin123)');

  // Create categories — ID = slug không dấu (dùng chung với storefront)
  const categoryNames = ['Rau Củ', 'Trái Cây', 'Đặc Sản Vùng Miền'];
  const categories: Record<string, string> = {};

  for (const name of categoryNames) {
    const id = slugify(name);
    const cat = await prisma.category.upsert({
      where: { id },
      update: { name },
      create: { id, name },
    });
    categories[name] = cat.id;
  }
  console.log('Created categories:', categoryNames.join(', '));

  // Create ~20 products
  const products = [
    // === Rau Củ (8) ===
    { name: 'Cà chua', price: 15000, unit: Unit.KG, categoryId: categories['Rau Củ'], stock: 100, description: 'Cà chua tươi trồng tại Đà Lạt' },
    { name: 'Xà lách', price: 12000, unit: Unit.BUNDLE, categoryId: categories['Rau Củ'], stock: 50, description: 'Xà lách xanh không thuốc trừ sâu' },
    { name: 'Rau muống', price: 8000, unit: Unit.BUNDLE, categoryId: categories['Rau Củ'], stock: 200, description: 'Rau muống tươi ngon mỗi ngày' },
    { name: 'Cải bó xôi', price: 18000, unit: Unit.BUNDLE, categoryId: categories['Rau Củ'], stock: 80, description: 'Cải bó xôi giòn ngọt' },
    { name: 'Dưa chuột', price: 10000, unit: Unit.KG, categoryId: categories['Rau Củ'], stock: 150, description: 'Dưa chuột giòn mát' },
    { name: 'Cà rốt', price: 14000, unit: Unit.KG, categoryId: categories['Rau Củ'], stock: 120, description: 'Cà rốt ngọt tại Đà Lạt' },
    { name: 'Khoai tây', price: 16000, unit: Unit.KG, categoryId: categories['Rau Củ'], stock: 90, description: 'Khoai tây vàng Đà Lạt' },
    { name: 'Hành lá', price: 5000, unit: Unit.BUNDLE, categoryId: categories['Rau Củ'], stock: 300, description: 'Hành lá tươi thơm' },

    // === Trái Cây (7) ===
    { name: 'Cam sành', price: 25000, unit: Unit.KG, categoryId: categories['Trái Cây'], stock: 200, description: 'Cam sành Vĩnh Long ngọt lịm' },
    { name: 'Xoài cát', price: 35000, unit: Unit.KG, categoryId: categories['Trái Cây'], stock: 80, description: 'Xoài cát Hòa Lộc thơm ngọt' },
    { name: 'Chuối laba', price: 20000, unit: Unit.BUNDLE, categoryId: categories['Trái Cây'], stock: 150, description: 'Chuối laba Tiền Giang' },
    { name: 'Dứa', price: 30000, unit: Unit.FRUIT, categoryId: categories['Trái Cây'], stock: 60, description: 'Dứa ngọt Cần Thơ' },
    { name: 'Bưởi da xanh', price: 45000, unit: Unit.FRUIT, categoryId: categories['Trái Cây'], stock: 40, description: 'Bưởi da xanh Hậu Giang' },
    { name: 'Măng cụt', price: 55000, unit: Unit.BOX, categoryId: categories['Trái Cây'], stock: 30, description: 'Măng cụt Tây Ninh thơm ngon' },
    { name: 'Sầu riêng', price: 120000, unit: Unit.FRUIT, categoryId: categories['Trái Cây'], stock: 20, description: 'Sầu riêng Ri6 Đồng Nai' },

    // === Đặc Sản Vùng Miền (6) ===
    { name: 'Thịt heo', price: 65000, unit: Unit.KG, categoryId: categories['Đặc Sản Vùng Miền'], stock: 30, description: 'Thịt heo sạch không kháng sinh' },
    { name: 'Gà ta', price: 85000, unit: Unit.KG, categoryId: categories['Đặc Sản Vùng Miền'], stock: 25, description: 'Gà ta thảo mộc Bình Định' },
    { name: 'Mật ong rừng', price: 75000, unit: Unit.BOX, categoryId: categories['Đặc Sản Vùng Miền'], stock: 40, description: 'Mật ong rừng nguyên chất' },
    { name: 'Nấm rơm', price: 120000, unit: Unit.BOX, categoryId: categories['Đặc Sản Vùng Miền'], stock: 15, description: 'Nấm rơm tươi Bình Dương' },
    { name: 'Thịt bò', price: 180000, unit: Unit.KG, categoryId: categories['Đặc Sản Vùng Miền'], stock: 10, description: 'Thịt bò Mỹ nhập khẩu đông lạnh' },
    { name: 'Tôm sú', price: 150000, unit: Unit.KG, categoryId: categories['Đặc Sản Vùng Miền'], stock: 12, description: 'Tôm sú Cà Mau tươi sống' },
  ];

  for (const product of products) {
    const id = slugify(product.name);
    await prisma.product.upsert({
      where: { id },
      update: { categoryId: product.categoryId },
      create: {
        id,
        ...product,
        status: ProductStatus.ACTIVE,
        imageUrl: `https://placehold.co/400x300/e0f2fe/1e40af?text=${encodeURIComponent(product.name)}`,
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
