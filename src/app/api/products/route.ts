import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    const isNew = searchParams.get('new');
    const hasDiscount = searchParams.get('discount');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { isActive: true };
    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (featured === 'true') where.isFeatured = true;
    if (bestseller === 'true') where.isBestseller = true;
    if (isNew === 'true') where.isNew = true;
    if (hasDiscount === 'true') { where.showDiscount = true; where.comparePrice = { not: null }; }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ]);

    return Response.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Products GET error:', error);
    return Response.json({ error: 'خطأ في جلب المنتجات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { _count, createdAt, updatedAt, category, ...rawData } = data;

    // Clean up data - remove undefined/empty optional fields
    const createData: any = { ...rawData, isActive: rawData.isActive ?? true };

    // Ensure required string fields have values
    if (!createData.name || !createData.name.trim()) {
      return Response.json({ error: 'اسم المنتج مطلوب' }, { status: 400 });
    }
    if (!createData.categoryId) {
      return Response.json({ error: 'الفئة مطلوبة' }, { status: 400 });
    }

    // Auto-generate slug if missing
    if (!createData.slug) {
      const baseSlug = createData.nameEn || createData.name;
      createData.slug = baseSlug.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-').replace(/-+/g, '-').substring(0, 60) + '-' + Date.now().toString(36);
    }
    // Auto-generate SKU if missing
    if (!createData.sku) {
      createData.sku = 'SKU-' + Date.now().toString(36);
    }
    // Auto-fill nameEn
    if (!createData.nameEn) {
      createData.nameEn = createData.name;
    }
    // Clean comparePrice
    if (!createData.comparePrice || createData.comparePrice === 0) {
      createData.comparePrice = null;
    }
    // Ensure price is a number
    createData.price = Number(createData.price) || 0;

    const product = await db.product.create({ data: createData });
    return Response.json(product);
  } catch (error: any) {
    console.error('Product POST error:', error);
    if (error.code === 'P2002') {
      return Response.json({ error: 'رمز SKU أو الرابط مستخدم بالفعل - استخدم رمز مختلف' }, { status: 400 });
    }
    return Response.json({ error: 'خطأ في إنشاء المنتج: ' + (error.message || '') }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, _count, createdAt, updatedAt, category, ...rawData } = data;
    if (!id) return Response.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });

    const updateData: any = { ...rawData };
    // Clean comparePrice
    if (!updateData.comparePrice || updateData.comparePrice === 0) {
      updateData.comparePrice = null;
    }

    const product = await db.product.update({ where: { id }, data: updateData });
    return Response.json(product);
  } catch (error: any) {
    console.error('Product PUT error:', error);
    if (error.code === 'P2002') {
      return Response.json({ error: 'رمز SKU أو الرابط مستخدم بالفعل' }, { status: 400 });
    }
    return Response.json({ error: 'خطأ في تحديث المنتج' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    await db.product.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return Response.json({ error: 'خطأ في حذف المنتج' }, { status: 500 });
  }
}
