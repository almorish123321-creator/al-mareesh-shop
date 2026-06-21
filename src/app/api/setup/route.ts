import { db } from '@/lib/db';

// SQL statements to create all tables (with IF NOT EXISTS for safety)
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "finished_at" TIMESTAMP(3),
  "migration_name" TEXT NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "avatar" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "comparePrice" DOUBLE PRECISION,
    "costPrice" DOUBLE PRECISION,
    "sku" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brand" TEXT,
    "sizes" TEXT,
    "colors" TEXT,
    "material" TEXT,
    "tags" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isBestseller" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "totalSold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingPhone" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingCity" TEXT NOT NULL,
    "shippingCountry" TEXT NOT NULL,
    "shippingPostalCode" TEXT,
    "notes" TEXT,
    "couponCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrder" DOUBLE PRECISION,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Slider" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Slider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);
`;

const createIndexesSQL = `
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscriber_email_key" ON "Subscriber"("email");
`;

const addForeignKeysSQL = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'BundleItem_bundleId_fkey') THEN
    ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Category_parentId_fkey') THEN
    ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Product_categoryId_fkey') THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Order_userId_fkey') THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OrderItem_orderId_fkey') THEN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'OrderItem_productId_fkey') THEN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CartItem_userId_fkey') THEN
    ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CartItem_productId_fkey') THEN
    ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WishlistItem_userId_fkey') THEN
    ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'WishlistItem_productId_fkey') THEN
    ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Review_userId_fkey') THEN
    ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Review_productId_fkey') THEN
    ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
`;

const categories = [
  { name: 'ملابس الأطفال', nameEn: 'Kids Clothing', slug: 'kids-clothing', description: 'أحدث صيحات ملابس الأطفال من المريش شوب', icon: 'Baby', sortOrder: 1 },
  { name: 'ملابس نسائية', nameEn: 'Women Clothing', slug: 'women-clothing', description: 'تشكيلة واسعة من الملابس النسائية الأنيقة', icon: 'Shirt', sortOrder: 2 },
  { name: 'أحذية', nameEn: 'Shoes', slug: 'shoes', description: 'أحذية عصرية للجميع', icon: 'Footprints', sortOrder: 3 },
  { name: 'فساتين أطفال', nameEn: 'Kids Dresses', slug: 'kids-dresses', description: 'فساتين بناتي رائعة', icon: 'Sparkles', sortOrder: 4 },
  { name: 'تيشيرت أطفال', nameEn: 'Kids T-Shirts', slug: 'kids-tshirts', description: 'تيشيرتات أطفال مريحة', icon: 'Shirt', sortOrder: 5 },
  { name: 'عبايات', nameEn: 'Abayas', slug: 'abayas', description: 'عبايات أنيقة ومحتشمة', icon: 'Crown', sortOrder: 6 },
  { name: 'بلوزات نسائية', nameEn: 'Women Blouses', slug: 'women-blouses', description: 'بلوزات نسائية عصرية', icon: 'Shirt', sortOrder: 7 },
  { name: 'أحذية رياضية', nameEn: 'Sports Shoes', slug: 'sports-shoes', description: 'أحذية رياضية مريحة', icon: 'Zap', sortOrder: 8 },
  { name: 'أحذية كاجوال', nameEn: 'Casual Shoes', slug: 'casual-shoes', description: 'أحذية كاجوال أنيقة', icon: 'Footprints', sortOrder: 9 },
];

const products = [
  { name: 'فستان بناتي زهري', nameEn: 'Pink Girls Dress', slug: 'pink-girls-dress', description: 'فستان بناتي أنيق بلون زهري رائع مناسب للحفلات والمناسبات الخاصة، مصنوع من أجود أنواع القطن المريح لبشرة طفلك', price: 129, comparePrice: 179, sku: 'KD-001', stock: 50, sizes: '["2-3","4-5","6-7","8-9"]', colors: '[{"name":"زهري","hex":"#FF69B4"},{"name":"أبيض","hex":"#FFFFFF"}]', isFeatured: true, isNew: true, categorySlug: 'kids-dresses' },
  { name: 'طقم أطفال قطني', nameEn: 'Cotton Kids Set', slug: 'cotton-kids-set', description: 'طقم أطفال قطني مريح يتضمن تيشيرت وبنطلون، مثالي للعب والحياة اليومية', price: 89, comparePrice: 120, sku: 'KD-002', stock: 75, sizes: '["2-3","4-5","6-7","8-9","10-11"]', colors: '[{"name":"أزرق","hex":"#4169E1"},{"name":"أخضر","hex":"#2E8B57"}]', isFeatured: true, isNew: false, isBestseller: true, categorySlug: 'kids-tshirts' },
  { name: 'جاكيت أطفال شتوي', nameEn: 'Kids Winter Jacket', slug: 'kids-winter-jacket', description: 'جاكيت شتوي دافئ ومقاوم للرياح، مثالي للرحلات والمدرسة في الأيام الباردة', price: 199, comparePrice: 259, sku: 'KD-003', stock: 30, sizes: '["4-5","6-7","8-9","10-11"]', colors: '[{"name":"أسود","hex":"#000000"},{"name":"أحمر","hex":"#DC143C"}]', isNew: true, categorySlug: 'kids-clothing' },
  { name: 'بنطلون جينز أطفال', nameEn: 'Kids Jeans', slug: 'kids-jeans', description: 'بنطلون جينز عالي الجودة بمرونة ممتازة، تصميم عصري يناسب جميع الإطلالات', price: 75, comparePrice: 99, sku: 'KD-004', stock: 60, sizes: '["4-5","6-7","8-9","10-11","12-13"]', colors: '[{"name":"أزرق غامق","hex":"#191970"},{"name":"أزرق فاتح","hex":"#6495ED"}]', isBestseller: true, categorySlug: 'kids-clothing' },
  { name: 'فستان أطفال سواريه', nameEn: 'Kids Party Dress', slug: 'kids-party-dress', description: 'فستان سواريه فاخر مزين بالترتر والكريستال، مثالي لحفلات الزفاف والمناسبات', price: 249, comparePrice: 350, sku: 'KD-005', stock: 20, sizes: '["2-3","4-5","6-7","8-9"]', colors: '[{"name":"ذهبي","hex":"#FFD700"},{"name":"فضي","hex":"#C0C0C0"}]', isFeatured: true, isNew: true, categorySlug: 'kids-dresses' },
  { name: 'عباية مطرزة فاخرة', nameEn: 'Luxury Embroidered Abaya', slug: 'luxury-embroidered-abaya', description: 'عباية مطرزة يدوياً بتصاميم شرقية أصيلة، مصنوعة من أجود أنواع القماش الكريب الإيطالي', price: 399, comparePrice: 549, sku: 'WC-001', stock: 25, sizes: '["S","M","L","XL","XXL"]', colors: '[{"name":"أسود","hex":"#000000"},{"name":"كحلي","hex":"#000080"}]', isFeatured: true, isNew: true, isBestseller: true, categorySlug: 'abayas' },
  { name: 'بلوزة حرير نسائية', nameEn: 'Silk Women Blouse', slug: 'silk-women-blouse', description: 'بلوزة حرير فاخرة بتصميم أنيق ومريح، مناسبة للعمل والسهرات', price: 189, comparePrice: 249, sku: 'WC-002', stock: 40, sizes: '["S","M","L","XL"]', colors: '[{"name":"بيج","hex":"#F5F5DC"},{"name":"أبيض","hex":"#FFFFFF"},{"name":"وردي","hex":"#FFB6C1"}]', isFeatured: true, categorySlug: 'women-blouses' },
  { name: 'فستان سهرة أنيق', nameEn: 'Elegant Evening Dress', slug: 'elegant-evening-dress', description: 'فستان سهرة فاخر بتصميم عصري وقصة مميزة تبرز أناقتك في كل مناسبة', price: 599, comparePrice: 799, sku: 'WC-003', stock: 15, sizes: '["S","M","L","XL"]', colors: '[{"name":"أسود","hex":"#000000"},{"name":"أحمر","hex":"#DC143C"},{"name":"أخضر زمردي","hex":"#50C878"}]', isFeatured: true, isNew: true, categorySlug: 'women-clothing' },
  { name: 'طقم عمل نسائي', nameEn: 'Women Work Set', slug: 'women-work-set', description: 'طقم عمل أنيق يتضمن جاكيت وتنورة، قماش عالي الجودة لا يكتسح بسهولة', price: 349, comparePrice: 450, sku: 'WC-004', stock: 35, sizes: '["S","M","L","XL","XXL"]', colors: '[{"name":"رمادي","hex":"#808080"},{"name":"كحلي","hex":"#000080"}]', isBestseller: true, categorySlug: 'women-clothing' },
  { name: 'عباءة كاجوال', nameEn: 'Casual Abaya', slug: 'casual-abaya', description: 'عباءة كاجوال مريحة للاستخدام اليومي، تصميم بسيط وأنيق', price: 199, comparePrice: 279, sku: 'WC-005', stock: 45, sizes: '["M","L","XL","XXL"]', colors: '[{"name":"أسود","hex":"#000000"},{"name":"رمادي غامق","hex":"#696969"}]', isBestseller: true, categorySlug: 'abayas' },
  { name: 'عباية ملونة عصرية', nameEn: 'Modern Colored Abaya', slug: 'modern-colored-abaya', description: 'عباية عصرية بألوان مميزة وتصميم مبتكر يجمع بين الأصالة والحداثة', price: 299, comparePrice: 399, sku: 'WC-006', stock: 30, sizes: '["S","M","L","XL"]', colors: '[{"name":"زيتي","hex":"#808000"},{"name":"نيلي","hex":"#4B0082"},{"name":"عنابي","hex":"#722F37"}]', isNew: true, isFeatured: true, categorySlug: 'abayas' },
  { name: 'حذاء رياضي نسائي', nameEn: 'Women Sports Shoes', slug: 'women-sports-shoes', description: 'حذاء رياضي مريح بتقنية امتصاص الصدمات، مثالي للجري والتمارين الرياضية', price: 249, comparePrice: 329, sku: 'SH-001', stock: 40, sizes: '["36","37","38","39","40","41"]', colors: '[{"name":"أبيض","hex":"#FFFFFF"},{"name":"أسود","hex":"#000000"},{"name":"وردي","hex":"#FF69B4"}]', isFeatured: true, isNew: true, isBestseller: true, categorySlug: 'sports-shoes' },
  { name: 'حذاء كعب عالي', nameEn: 'High Heel Shoes', slug: 'high-heel-shoes', description: 'حذاء كعب عالي أنيق بتصميم كلاسيكي، مناسب للحفلات والمناسبات الرسمية', price: 329, comparePrice: 429, sku: 'SH-002', stock: 20, sizes: '["36","37","38","39","40"]', colors: '[{"name":"أسود","hex":"#000000"},{"name":"ذهبي","hex":"#FFD700"},{"name":"أحمر","hex":"#DC143C"}]', isFeatured: true, categorySlug: 'shoes' },
  { name: 'حذاء أطفال رياضي', nameEn: 'Kids Sports Shoes', slug: 'kids-sports-shoes', description: 'حذاء رياضي للأطفال بتصميم ممتع وألوان مبهجة، خفيف الوزن ومريح', price: 119, comparePrice: 159, sku: 'SH-003', stock: 55, sizes: '["28","30","32","34","36"]', colors: '[{"name":"أزرق","hex":"#4169E1"},{"name":"أحمر","hex":"#DC143C"},{"name":"أخضر","hex":"#2E8B57"}]', isBestseller: true, isNew: true, categorySlug: 'sports-shoes' },
  { name: 'حذاء كاجوال نسائي', nameEn: 'Women Casual Shoes', slug: 'women-casual-shoes', description: 'حذاء كاجوال مريح وأنيق، مناسب للاستخدام اليومي والخروجات', price: 179, comparePrice: 229, sku: 'SH-004', stock: 35, sizes: '["36","37","38","39","40","41"]', colors: '[{"name":"بيج","hex":"#F5F5DC"},{"name":"أسود","hex":"#000000"}]', isBestseller: true, categorySlug: 'casual-shoes' },
  { name: 'صندل نسائي أنيق', nameEn: 'Elegant Women Sandals', slug: 'elegant-women-sandals', description: 'صندل نسائي أنيق مناسب للصيف، تصميم مريح مع نعل داعم', price: 149, comparePrice: 199, sku: 'SH-005', stock: 45, sizes: '["36","37","38","39","40"]', colors: '[{"name":"ذهبي","hex":"#FFD700"},{"name":"فضي","hex":"#C0C0C0"},{"name":"أسود","hex":"#000000"}]', isNew: true, categorySlug: 'shoes' },
  { name: 'حذاء أطفال مريح', nameEn: 'Comfortable Kids Shoes', slug: 'comfortable-kids-shoes', description: 'حذاء أطفال مريح بتصميم مرن يدعم صحة القدم، نعل طبي مضاد للانزلاق', price: 99, comparePrice: 139, sku: 'SH-006', stock: 60, sizes: '["26","28","30","32","34"]', colors: '[{"name":"وردي","hex":"#FF69B4"},{"name":"أزرق","hex":"#4169E1"}]', isBestseller: true, categorySlug: 'casual-shoes' },
];

export async function GET() {
  const logs: string[] = [];

  try {
    // Step 1: Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'متغير DATABASE_URL غير مضبوط في Vercel. اذهب إلى Settings > Environment Variables وأضفه.', logs }, { status: 500 });
    }
    logs.push('✅ DATABASE_URL موجود');

    // Step 2: Create tables using raw SQL
    logs.push('🔄 إنشاء الجداول...');
    try {
      await db.$executeRawUnsafe(createTablesSQL);
      logs.push('✅ تم إنشاء الجداول');
    } catch (tableError: any) {
      logs.push(`⚠️ تحذير في إنشاء الجداول: ${tableError.message?.substring(0, 200)}`);
      // Continue - tables might already exist
    }

    // Step 3: Create indexes
    logs.push('🔄 إنشاء الفهارس...');
    try {
      await db.$executeRawUnsafe(createIndexesSQL);
      logs.push('✅ تم إنشاء الفهارس');
    } catch (indexError: any) {
      logs.push(`⚠️ تحذير في إنشاء الفهارس: ${indexError.message?.substring(0, 200)}`);
    }

    // Step 4: Add foreign keys
    logs.push('🔄 إضافة المفاتيح الخارجية...');
    try {
      await db.$executeRawUnsafe(addForeignKeysSQL);
      logs.push('✅ تم إضافة المفاتيح الخارجية');
    } catch (fkError: any) {
      logs.push(`⚠️ تحذير في المفاتيح الخارجية: ${fkError.message?.substring(0, 200)}`);
    }

    // Step 5: Check if data already exists
    const existingCategories = await db.category.count();
    if (existingCategories > 0) {
      logs.push(`ℹ️ قاعدة البيانات مليئة بالفعل (${existingCategories} فئة)`);
      return Response.json({ message: 'قاعدة البيانات جاهزة بالفعل', categories: existingCategories, logs });
    }

    // Step 6: Seed categories
    logs.push('🔄 إضافة الفئات...');
    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      try {
        const created = await db.category.create({
          data: { name: cat.name, nameEn: cat.nameEn, slug: cat.slug, description: cat.description, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true }
        });
        categoryMap[cat.slug] = created.id;
      } catch (catErr: any) {
        logs.push(`⚠️ خطأ في فئة ${cat.name}: ${catErr.message?.substring(0, 100)}`);
      }
    }
    logs.push(`✅ تم إضافة ${Object.keys(categoryMap).length} فئة`);

    // Step 7: Seed products
    logs.push('🔄 إضافة المنتجات...');
    let productsCreated = 0;
    for (const prod of products) {
      const categoryId = categoryMap[prod.categorySlug] || categoryMap['kids-clothing'];
      if (!categoryId) {
        logs.push(`⚠️ لم يتم العثور على فئة: ${prod.categorySlug}`);
        continue;
      }
      try {
        await db.product.create({
          data: {
            name: prod.name, nameEn: prod.nameEn, slug: prod.slug, description: prod.description,
            price: prod.price, comparePrice: prod.comparePrice, sku: prod.sku, stock: prod.stock,
            images: JSON.stringify([
              `https://placehold.co/600x800/E8D5C4/8B1A4A?text=${encodeURIComponent(prod.nameEn)}`,
              `https://placehold.co/600x800/F5E6D3/D4A853?text=${encodeURIComponent(prod.nameEn + ' 2')}`
            ]),
            categoryId, sizes: prod.sizes, colors: prod.colors,
            isFeatured: prod.isFeatured || false, isNew: prod.isNew || false, isBestseller: prod.isBestseller || false, isActive: true,
          }
        });
        productsCreated++;
      } catch (prodErr: any) {
        logs.push(`⚠️ خطأ في منتج ${prod.name}: ${prodErr.message?.substring(0, 100)}`);
      }
    }
    logs.push(`✅ تم إضافة ${productsCreated} منتج`);

    // Step 8: Seed admin user
    logs.push('🔄 إضافة حساب المدير...');
    try {
      await db.user.create({
        data: { email: 'admin@mareesh.com', name: 'مدير المريش شوب', password: Buffer.from('admin123').toString('base64'), role: 'admin', isActive: true }
      });
      logs.push('✅ تم إنشاء حساب المدير');
    } catch (userErr: any) {
      if (userErr.message?.includes('Unique')) {
        logs.push('ℹ️ حساب المدير موجود بالفعل');
      } else {
        logs.push(`⚠️ خطأ في إنشاء المدير: ${userErr.message?.substring(0, 100)}`);
      }
    }

    // Step 9: Seed coupons
    logs.push('🔄 إضافة كوبونات الخصم...');
    try {
      await db.coupon.createMany({
        data: [
          { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 100, isActive: true },
          { code: 'MAREESH50', type: 'fixed', value: 50, minOrder: 200, isActive: true }
        ]
      });
      logs.push('✅ تم إضافة كوبونات الخصم');
    } catch (couponErr: any) {
      logs.push(`⚠️ خطأ في الكوبونات: ${couponErr.message?.substring(0, 100)}`);
    }

    // Step 10: Seed sliders
    logs.push('🔄 إضافة السلايدرات...');
    try {
      await db.slider.createMany({
        data: [
          { title: 'تشكيلة ملابس الأطفال', titleEn: 'Kids Collection', subtitle: 'خصم يصل إلى 40% على جميع ملابس الأطفال', image: 'https://placehold.co/1400x500/8B1A4A/FFFFFF?text=Kids+Collection', sortOrder: 1, isActive: true },
          { title: 'عبايات فاخرة', titleEn: 'Luxury Abayas', subtitle: 'اكتشفي أحدث تشكيلات العبايات المطرزة', image: 'https://placehold.co/1400x500/D4A853/000000?text=Luxury+Abayas', sortOrder: 2, isActive: true },
          { title: 'أحذية عصرية', titleEn: 'Trendy Shoes', subtitle: 'أحذية رياضية وكاجوال بأسعار مميزة', image: 'https://placehold.co/1400x500/2E8B57/FFFFFF?text=Trendy+Shoes', sortOrder: 3, isActive: true },
        ]
      });
      logs.push('✅ تم إضافة السلايدرات');
    } catch (sliderErr: any) {
      logs.push(`⚠️ خطأ في السلايدرات: ${sliderErr.message?.substring(0, 100)}`);
    }

    // Step 11: Seed settings
    logs.push('🔄 إضافة الإعدادات...');
    try {
      await db.setting.createMany({
        data: [
          { key: 'store_name', value: 'المريش شوب' }, { key: 'store_name_en', value: 'Al-Mareesh Shop' },
          { key: 'store_email', value: 'info@mareesh.com' }, { key: 'store_phone', value: '+966500000000' },
          { key: 'store_currency', value: 'SAR' }, { key: 'store_language', value: 'ar' },
          { key: 'shipping_cost', value: '25' }, { key: 'free_shipping_threshold', value: '300' },
        ]
      });
      logs.push('✅ تم إضافة الإعدادات');
    } catch (settingErr: any) {
      logs.push(`⚠️ خطأ في الإعدادات: ${settingErr.message?.substring(0, 100)}`);
    }

    logs.push('🎉 تم إعداد المتجر بنجاح!');

    return Response.json({
      message: 'تم إعداد المتجر بنجاح!',
      categories: Object.keys(categoryMap).length,
      products: productsCreated,
      adminEmail: 'admin@mareesh.com',
      adminPassword: 'admin123',
      coupons: ['WELCOME10', 'MAREESH50'],
      logs
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    logs.push(`❌ خطأ عام: ${error.message?.substring(0, 300)}`);
    return Response.json({
      error: 'خطأ في إعداد قاعدة البيانات',
      details: error.message?.substring(0, 300),
      hint: 'تأكد من ضبط DATABASE_URL في Vercel > Settings > Environment Variables',
      logs
    }, { status: 500 });
  }
}
