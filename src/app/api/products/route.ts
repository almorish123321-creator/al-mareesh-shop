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
    const limit = parseInt(searchParams.get('limit') || '9999');

    const where: any = { isActive: true };
    if (category) {
      const cat = await db.category.findFirst({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
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

    // Clean up data
    const createData: any = { ...rawData, isActive: rawData.isActive ?? true };

    // Validate required fields
    if (!createData.name || !createData.name.trim()) {
      return Response.json({ error: 'اسم المنتج مطلوب' }, { status: 400 });
    }
    if (!createData.categoryId) {
      return Response.json({ error: 'الفئة مطلوبة' }, { status: 400 });
    }

    // Auto-generate slug if missing - with retry on collision
    const generateSlug = (base: string) => {
      const clean = base.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-').replace(/-+/g, '-').substring(0, 60);
      return `${clean}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    };
    const generateSKU = () => `SKU-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    if (!createData.slug) {
      createData.slug = generateSlug(createData.nameEn || createData.name);
    }
    if (!createData.sku) {
      createData.sku = generateSKU();
    }
    if (!createData.nameEn) {
      createData.nameEn = createData.name;
    }
    if (!createData.description) {
      createData.description = createData.name;
    }
    // Clean comparePrice
    if (!createData.comparePrice || createData.comparePrice === 0) {
      createData.comparePrice = null;
    }
    createData.price = Number(createData.price) || 0;

    // Try creating with retry on unique constraint violation
    let product;
    let attempts = 0;
    while (attempts < 3) {
      try {
        product = await db.product.create({ data: createData });
        break;
      } catch (err: any) {
        if (err.code === 'P2002' && attempts < 2) {
          // Unique constraint violation - regenerate slug and SKU
          createData.slug = generateSlug(createData.nameEn || createData.name);
          createData.sku = generateSKU();
          attempts++;
        } else {
          throw err;
        }
      }
    }

    return Response.json(product);
  } catch (error: any) {
    console.error('Product POST error:', error);
    if (error.code === 'P2002') {
      return Response.json({ error: 'رمز SKU أو الرابط مستخدم بالفعل - حاول مرة أخرى' }, { status: 400 });
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
