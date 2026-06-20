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
    const category = await db.category.create({ data });
    return Response.json(category);
  } catch (error) {
    console.error('Category POST error:', error);
    return Response.json({ error: 'خطأ في إنشاء الفئة' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
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
