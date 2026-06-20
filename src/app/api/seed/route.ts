import { db } from '@/lib/db';

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
  try {
    const existingCategories = await db.category.count();
    if (existingCategories > 0) {
      return Response.json({ message: 'قاعدة البيانات مليئة بالفعل', categories: existingCategories });
    }

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      const created = await db.category.create({
        data: { name: cat.name, nameEn: cat.nameEn, slug: cat.slug, description: cat.description, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true }
      });
      categoryMap[cat.slug] = created.id;
    }

    let productsCreated = 0;
    for (const prod of products) {
      const categoryId = categoryMap[prod.categorySlug] || categoryMap['kids-clothing'];
      await db.product.create({
        data: {
          name: prod.name, nameEn: prod.nameEn, slug: prod.slug, description: prod.description,
          price: prod.price, comparePrice: prod.comparePrice, sku: prod.sku, stock: prod.stock,
          images: JSON.stringify([`https://placehold.co/600x800/E8D5C4/8B1A4A?text=${encodeURIComponent(prod.nameEn)}`, `https://placehold.co/600x800/F5E6D3/D4A853?text=${encodeURIComponent(prod.nameEn + ' 2')}`]),
          categoryId, sizes: prod.sizes, colors: prod.colors,
          isFeatured: prod.isFeatured || false, isNew: prod.isNew || false, isBestseller: prod.isBestseller || false, isActive: true,
        }
      });
      productsCreated++;
    }

    await db.user.create({ data: { email: 'admin@mareesh.com', name: 'مدير المريش شوب', password: Buffer.from('admin123').toString('base64'), role: 'admin', isActive: true } });
    await db.coupon.createMany({ data: [{ code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 100, isActive: true }, { code: 'MAREESH50', type: 'fixed', value: 50, minOrder: 200, isActive: true }] });
    await db.slider.createMany({ data: [
      { title: 'تشكيلة ملابس الأطفال', titleEn: 'Kids Collection', subtitle: 'خصم يصل إلى 40% على جميع ملابس الأطفال', image: 'https://placehold.co/1400x500/8B1A4A/FFFFFF?text=Kids+Collection', sortOrder: 1, isActive: true },
      { title: 'عبايات فاخرة', titleEn: 'Luxury Abayas', subtitle: 'اكتشفي أحدث تشكيلات العبايات المطرزة', image: 'https://placehold.co/1400x500/D4A853/000000?text=Luxury+Abayas', sortOrder: 2, isActive: true },
      { title: 'أحذية عصرية', titleEn: 'Trendy Shoes', subtitle: 'أحذية رياضية وكاجوال بأسعار مميزة', image: 'https://placehold.co/1400x500/2E8B57/FFFFFF?text=Trendy+Shoes', sortOrder: 3, isActive: true },
    ] });
    await db.setting.createMany({ data: [
      { key: 'store_name', value: 'المريش شوب' }, { key: 'store_name_en', value: 'Al-Mareesh Shop' },
      { key: 'store_email', value: 'info@mareesh.com' }, { key: 'store_phone', value: '+966500000000' },
      { key: 'store_currency', value: 'SAR' }, { key: 'store_language', value: 'ar' },
      { key: 'shipping_cost', value: '25' }, { key: 'free_shipping_threshold', value: '300' },
    ] });

    return Response.json({ message: 'تم تعبئة قاعدة البيانات بنجاح', categories: categories.length, products: productsCreated });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: 'خطأ في تعبئة قاعدة البيانات' }, { status: 500 });
  }
}
