import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const where: any = { isActive: true };
    if (productId) where.productId = productId;

    const reviews = await db.review.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(reviews);
  } catch (error) {
    console.error('Reviews GET error:', error);
    return Response.json({ error: 'خطأ في جلب التقييمات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.productId || !data.userId || !data.rating) {
      return Response.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }
    const review = await db.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: Math.min(5, Math.max(1, data.rating)),
        title: data.title || null,
        comment: data.comment || '',
        isActive: true,
      },
    });

    // Update product average rating
    const stats = await db.review.aggregate({
      where: { productId: data.productId, isActive: true },
      _avg: { rating: true },
      _count: true,
    });
    await db.product.update({
      where: { id: data.productId },
      data: { avgRating: Math.round((stats._avg.rating || 0) * 10) / 10, reviewCount: stats._count },
    });

    return Response.json(review);
  } catch (error) {
    console.error('Review POST error:', error);
    return Response.json({ error: 'خطأ في إضافة التقييم' }, { status: 500 });
  }
}
