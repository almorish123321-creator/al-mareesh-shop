import { db } from '@/lib/db';

export async function GET() {
  try {
    const bundles = await db.bundle.findMany({
      where: { isActive: true },
      include: { items: true },
      orderBy: { sortOrder: 'asc' },
    });
    return Response.json(bundles);
  } catch (error) {
    console.error('Bundles GET error:', error);
    return Response.json({ error: 'خطأ في جلب الباقات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { items, ...bundleData } = data;

    const bundle = await db.bundle.create({
      data: {
        name: bundleData.name,
        description: bundleData.description || null,
        image: bundleData.image || null,
        discount: bundleData.discount || 0,
        isActive: bundleData.isActive ?? true,
        sortOrder: bundleData.sortOrder || 0,
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            price: item.price,
            image: item.image || null,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: { items: true },
    });

    return Response.json(bundle);
  } catch (error) {
    console.error('Bundle POST error:', error);
    return Response.json({ error: 'خطأ في إنشاء الباقة' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, items, ...bundleData } = data;
    if (!id) return Response.json({ error: 'معرف الباقة مطلوب' }, { status: 400 });

    // Delete old items and recreate
    await db.bundleItem.deleteMany({ where: { bundleId: id } });

    const bundle = await db.bundle.update({
      where: { id },
      data: {
        name: bundleData.name,
        description: bundleData.description || null,
        image: bundleData.image || null,
        discount: bundleData.discount || 0,
        isActive: bundleData.isActive ?? true,
        sortOrder: bundleData.sortOrder || 0,
        items: {
          create: (items || []).map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            price: item.price,
            image: item.image || null,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: { items: true },
    });

    return Response.json(bundle);
  } catch (error) {
    console.error('Bundle PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الباقة' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'معرف الباقة مطلوب' }, { status: 400 });

    await db.bundleItem.deleteMany({ where: { bundleId: id } });
    await db.bundle.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Bundle DELETE error:', error);
    return Response.json({ error: 'خطأ في حذف الباقة' }, { status: 500 });
  }
}
