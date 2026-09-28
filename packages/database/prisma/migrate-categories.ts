import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env từ thư mục gốc workspace
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL không được set. Hãy kiểm tra file .env');
  process.exit(1);
}

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
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log('Bắt đầu migrate categories...');

  try {
    // Lấy tất cả categories hiện có
    const { rows: categories } = await client.query(
      'SELECT id, name FROM "Category" ORDER BY "createdAt" ASC'
    );
    console.log(`Tìm thấy ${categories.length} categories`);

    for (const category of categories) {
      const newId = slugify(category.name);

      if (newId === category.id) {
        console.log(`  ✓ Category "${category.name}" đã có ID đúng: ${category.id}`);
        continue;
      }

      console.log(`  → Category "${category.name}": ${category.id} → ${newId}`);

      // Kiểm tra xem category mới đã tồn tại chưa
      const { rows: existing } = await client.query(
        'SELECT id FROM "Category" WHERE id = $1',
        [newId]
      );

      if (existing.length > 0) {
        // Nếu đã tồn tại, chỉ cần update products sang category mới
        console.log(`    Category mới đã tồn tại, update products...`);
        const { rowCount } = await client.query(
          'UPDATE "Product" SET "categoryId" = $1 WHERE "categoryId" = $2',
          [newId, category.id]
        );
        console.log(`    Đã update ${rowCount} products`);
        // Xóa category cũ
        await client.query('DELETE FROM "Category" WHERE id = $1', [category.id]);
      } else {
        // Nếu chưa tồn tại, tạo category mới, update products, xóa category cũ
        await client.query('BEGIN');
        try {
          // Tạo category mới
          await client.query(
            'INSERT INTO "Category" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
            [newId, category.name]
          );

          // Update products sang category mới
          const { rowCount } = await client.query(
            'UPDATE "Product" SET "categoryId" = $1 WHERE "categoryId" = $2',
            [newId, category.id]
          );
          console.log(`    Đã update ${rowCount} products`);

          // Xóa category cũ
          await client.query('DELETE FROM "Category" WHERE id = $1', [category.id]);

          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      }
    }

    console.log('Hoàn thành migrate categories!');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
