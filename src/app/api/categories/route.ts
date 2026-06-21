import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: 'asc' },
    });
    return Response.json(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return Response.json({ error: 'خطأ في جلب الفئات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { _count, createdAt, updatedAt, ...createData } = data;

    // Auto-generate nameEn if missing
    if (!createData.nameEn || !createData.nameEn.trim()) {
      createData.nameEn = createData.name || 'Category';
    }

    // Auto-generate slug if missing - with retry on collision
    const generateSlug = (base: string) => {
      const clean = base.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-').replace(/-+/g, '-').substring(0, 50);
      return `${clean}-${Date.now().toString(36)}`;
    };

    if (!createData.slug || !createData.slug.trim()) {
      createData.slug = generateSlug(createData.nameEn || createData.name);
    }

    createData.isActive = createData.isActive ?? true;

    // Try creating with retry on unique constraint violation
    let category;
    let attempts = 0;
    while (attempts < 3) {
      try {
        category = await db.category.create({ data: createData });
        break;
      } catch (err: any) {
        if (err.code === 'P2002' && attempts < 2) {
          createData.slug = generateSlug(createData.nameEn || createData.name);
          attempts++;
        } else {
          throw err;
        }
      }
    }

    return Response.json(category);
  } catch (error: any) {
    console.error('Category POST error:', error);
    if (error.code === 'P2002') {
      return Response.json({ error: 'الرابط (Slug) مستخدم بالفعل - حاول مرة أخرى' }, { status: 400 });
    }
    return Response.json({ error: 'خطأ في إنشاء الفئة: ' + (error.message || '') }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, _count, createdAt, updatedAt, ...updateData } = data;
    if (!id) return Response.json({ error: 'معرف الفئة مطلوب' }, { status: 400 });
    const category = await db.category.update({ where: { id }, data: updateData });
    return Response.json(category);
  } catch (error) {
    console.error('Category PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الفئة' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'معرف الفئة مطلوب' }, { status: 400 });
    await db.category.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return Response.json({ error: 'خطأ في حذف الفئة' }, { status: 500 });
  }
}
