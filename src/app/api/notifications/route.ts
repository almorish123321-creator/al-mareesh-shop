import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// GET /api/notifications - جلب الإشعارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unread') === 'true';
    const forAdmin = searchParams.get('admin') === 'true';

    const where: any = {};
    if (forAdmin) {
      where.userId = null; // إشعارات الأدمن
    } else if (userId) {
      where.userId = userId;
    }
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await db.orderNotification.findMany({
      where,
      include: { order: { select: { orderNumber: true, status: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.orderNotification.count({
      where: { ...where, isRead: false },
    });

    return Response.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return Response.json({ error: 'خطأ في جلب الإشعارات' }, { status: 500 });
  }
}

// PUT /api/notifications - تحديث حالة القراءة
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (data.markAllRead) {
      const where: any = {};
      if (data.forAdmin) {
        where.userId = null;
      } else if (data.userId) {
        where.userId = data.userId;
      }
      await db.orderNotification.updateMany({
        where: { ...where, isRead: false },
        data: { isRead: true },
      });
      return Response.json({ success: true });
    }

    if (data.id) {
      await db.orderNotification.update({
        where: { id: data.id },
        data: { isRead: true },
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'معرف الإشعار مطلوب' }, { status: 400 });
  } catch (error) {
    console.error('Notification PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الإشعار' }, { status: 500 });
  }
}

// POST /api/notifications - إنشاء إشعار (داخلي)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const notification = await db.orderNotification.create({
      data: {
        orderId: data.orderId,
        userId: data.userId || null,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });
    return Response.json(notification);
  } catch (error) {
    console.error('Notification POST error:', error);
    return Response.json({ error: 'خطأ في إنشاء الإشعار' }, { status: 500 });
  }
}
