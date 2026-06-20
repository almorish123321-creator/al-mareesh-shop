import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return Response.json({ items: [] });
    const items = await db.cartItem.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
    });
    return Response.json({ items });
  } catch (error) {
    console.error('Cart GET error:', error);
    return Response.json({ error: 'خطأ في جلب السلة' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Check if item already in cart
    const existing = await db.cartItem.findFirst({
      where: { userId: data.userId, productId: data.productId, size: data.size || null, color: data.color || null }
    });
    if (existing) {
      const updated = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (data.quantity || 1) },
        include: { product: true }
      });
      return Response.json(updated);
    }
    const item = await db.cartItem.create({
      data: { userId: data.userId, productId: data.productId, quantity: data.quantity || 1, size: data.size, color: data.color },
      include: { product: true }
    });
    return Response.json(item);
  } catch (error) {
    console.error('Cart POST error:', error);
    return Response.json({ error: 'خطأ في إضافة للسلة' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await db.cartItem.update({
      where: { id: data.id },
      data: { quantity: data.quantity },
      include: { product: true }
    });
    return Response.json(item);
  } catch (error) {
    console.error('Cart PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث السلة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    if (id) {
      await db.cartItem.delete({ where: { id } });
    } else if (userId) {
      await db.cartItem.deleteMany({ where: { userId } });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return Response.json({ error: 'خطأ في حذف من السلة' }, { status: 500 });
  }
}
