import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// GET /api/coupons/all - Admin: list all coupons
export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(coupons);
  } catch (error) {
    console.error('Coupons list error:', error);
    return Response.json({ error: 'خطأ في جلب الكوبونات' }, { status: 500 });
  }
}

// POST /api/coupons/all - Admin: create coupon
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, createdAt, updatedAt, usedCount, ...couponData } = data;
    
    const coupon = await db.coupon.create({
      data: couponData,
    });
    return Response.json(coupon);
  } catch (error: any) {
    console.error('Coupon create error:', error);
    if (error?.code === 'P2002') {
      return Response.json({ error: 'كود الخصم موجود مسبقاً' }, { status: 400 });
    }
    return Response.json({ error: 'خطأ في إنشاء الكوبون' }, { status: 500 });
  }
}

// PUT /api/coupons/all - Admin: update coupon
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, createdAt, updatedAt, ...updateData } = data;
    if (!id) return Response.json({ error: 'معرف الكوبون مطلوب' }, { status: 400 });

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });
    return Response.json(coupon);
  } catch (error) {
    console.error('Coupon update error:', error);
    return Response.json({ error: 'خطأ في تحديث الكوبون' }, { status: 500 });
  }
}

// DELETE /api/coupons/all - Admin: delete coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'معرف الكوبون مطلوب' }, { status: 400 });

    await db.coupon.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Coupon delete error:', error);
    return Response.json({ error: 'خطأ في حذف الكوبون' }, { status: 500 });
  }
}
