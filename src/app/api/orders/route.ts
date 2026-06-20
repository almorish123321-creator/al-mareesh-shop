import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const orders = await db.order.findMany({
      where,
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return Response.json({ error: 'خطأ في جلب الطلبات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const orderNumber = 'MR-' + Date.now().toString(36).toUpperCase();
    const order = await db.order.create({
      data: { orderNumber, ...data },
      include: { items: true },
    });
    // Update product stock
    for (const item of data.items || []) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, totalSold: { increment: item.quantity } }
      });
    }
    // Clear user cart
    if (data.userId) {
      await db.cartItem.deleteMany({ where: { userId: data.userId } });
    }
    return Response.json(order);
  } catch (error) {
    console.error('Order POST error:', error);
    return Response.json({ error: 'خطأ في إنشاء الطلب' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const order = await db.order.update({ where: { id }, data: updateData });
    return Response.json(order);
  } catch (error) {
    console.error('Order PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الطلب' }, { status: 500 });
  }
}
