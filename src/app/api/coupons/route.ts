import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!code) return Response.json({ error: 'كود الخصم مطلوب' }, { status: 400 });

    const coupon = await db.coupon.findUnique({ where: { code, isActive: true } });
    if (!coupon) return Response.json({ error: 'كود الخصم غير صالح' }, { status: 404 });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return Response.json({ error: 'انتهت صلاحية كود الخصم' }, { status: 400 });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return Response.json({ error: 'تم استخدام كود الخصم للحد الأقصى' }, { status: 400 });
    if (coupon.minOrder && subtotal < coupon.minOrder) return Response.json({ error: `الحد الأدنى للطلب ${coupon.minOrder} ر.س` }, { status: 400 });

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    return Response.json({ coupon, discount: Math.round(discount * 100) / 100 });
  } catch (error) {
    console.error('Coupon GET error:', error);
    return Response.json({ error: 'خطأ في التحقق من كود الخصم' }, { status: 500 });
  }
}
