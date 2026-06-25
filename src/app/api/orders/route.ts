import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const orderNumber = searchParams.get('number');

    // Track order by order number (public - no auth needed)
    if (orderNumber) {
      const order = await db.order.findFirst({
        where: { orderNumber },
        include: { items: true, notifications: { orderBy: { createdAt: 'desc' }, take: 10 } },
      });
      if (!order) return Response.json({ error: 'لم يتم العثور على الطلب' }, { status: 404 });
      return Response.json(order);
    }

    // Admin: get all orders
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const orders = await db.order.findMany({
      where,
      include: { items: true, user: { select: { id: true, name: true, email: true, phone: true } } },
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

    // Handle guest users
    let userId = data.userId;
    if (!userId || userId === 'guest') {
      let guestUser = await db.user.findFirst({ where: { role: 'customer', name: 'ضيف' }, orderBy: { createdAt: 'desc' } });
      if (!guestUser) {
        guestUser = await db.user.create({
          data: {
            email: `guest-${Date.now()}@mareesh.com`,
            name: data.shippingName || 'ضيف',
            password: Buffer.from('guest-' + Date.now()).toString('base64'),
            phone: data.shippingPhone || '',
            role: 'customer',
            isActive: true,
          },
        });
      }
      userId = guestUser.id;
    } else {
      const existingUser = await db.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        const guestUser = await db.user.create({
          data: {
            email: `guest-${Date.now()}@mareesh.com`,
            name: data.shippingName || 'ضيف',
            password: Buffer.from('guest-' + Date.now()).toString('base64'),
            phone: data.shippingPhone || '',
            role: 'customer',
            isActive: true,
          },
        });
        userId = guestUser.id;
      }
    }

    // Validate products
    const items = data.items || [];
    const validItems = [];
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (product) {
        validItems.push({
          productId: item.productId,
          name: item.name || product.name,
          price: item.price || product.price,
          quantity: item.quantity || 1,
          size: item.size || null,
          color: item.color || null,
          total: (item.price || product.price) * (item.quantity || 1),
        });
      } else {
        let fallbackProduct = await db.product.findFirst();
        if (!fallbackProduct) continue;
        validItems.push({
          productId: fallbackProduct.id,
          name: item.name || 'منتج',
          price: item.price || 0,
          quantity: item.quantity || 1,
          size: item.size || null,
          color: item.color || null,
          total: (item.price || 0) * (item.quantity || 1),
        });
      }
    }

    if (validItems.length === 0) {
      return Response.json({ error: 'لا توجد منتجات صالحة في الطلب' }, { status: 400 });
    }

    const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);

    // تحديد حالة الدفع بناءً على رفع الإيصال
    const hasPaymentReceipt = !!data.paymentReceipt;
    const paymentStatus = hasPaymentReceipt ? 'pending_verification' : (data.paymentMethod === 'cod' ? 'unpaid' : 'unpaid');

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: 'pending',
        paymentMethod: data.paymentMethod || 'cod',
        paymentStatus,
        subtotal: data.subtotal || subtotal,
        shippingCost: data.shippingCost || 0,
        discount: data.discount || 0,
        total: data.total || subtotal + (data.shippingCost || 0) - (data.discount || 0),
        shippingName: data.shippingName || '',
        shippingPhone: data.shippingPhone || '',
        shippingAddress: data.shippingAddress || '',
        shippingCity: data.shippingCity || '',
        shippingCountry: data.shippingCountry || 'اليمن',
        shippingPostalCode: data.shippingPostalCode || '',
        notes: data.notes || null,
        couponCode: data.couponCode || null,
        paymentReceipt: data.paymentReceipt || null,
        paymentTransactionId: data.paymentTransactionId || null,
        items: {
          create: validItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            total: item.total,
          })),
        },
        notifications: {
          create: [
            {
              userId: null, // إشعار للأدمن
              type: 'order_placed',
              title: 'طلب جديد',
              message: `طلب جديد ${orderNumber} من ${data.shippingName || 'ضيف'} - المبلغ: ${data.total || subtotal} ر.س`,
            },
            ...(hasPaymentReceipt ? [{
              userId: null,
              type: 'payment_uploaded',
              title: 'إيصال دفع جديد',
              message: `تم رفع إيصال دفع للطلب ${orderNumber} - يرجى التحقق`,
            }] : []),
          ],
        },
      },
      include: { items: true },
    });

    // Update stock
    for (const item of validItems) {
      try {
        const product = await db.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock > 0) {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: Math.min(item.quantity, product.stock) },
              totalSold: { increment: item.quantity },
            },
          });
        }
      } catch { /* skip */ }
    }

    console.log(`✅ Order created: ${orderNumber} - ${validItems.length} items - Total: ${order.total} - Receipt: ${hasPaymentReceipt ? 'Yes' : 'No'}`);

    return Response.json(order);
  } catch (error: any) {
    console.error('Order POST error:', error);
    return Response.json({
      error: 'خطأ في إنشاء الطلب',
      details: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, _count, createdAt, updatedAt, items, user, notifications, ...updateData } = data;
    if (!id) return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });

    // جلب الطلب القديم لمقارنة التغييرات
    const oldOrder = await db.order.findUnique({ where: { id } });
    
    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    // إنشاء إشعارات عند تغيير الحالة
    if (updateData.status && oldOrder && oldOrder.status !== updateData.status) {
      const statusMap: Record<string, string> = {
        pending: 'قيد الانتظار',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      };
      
      await db.orderNotification.create({
        data: {
          orderId: id,
          userId: order.userId,
          type: 'status_changed',
          title: 'تحديث حالة الطلب',
          message: `تم تحديث حالة طلبك ${order.orderNumber} إلى: ${statusMap[updateData.status] || updateData.status}`,
        },
      });

      // إرسال واتساب للزبون إذا كان رقمه موجود
      try {
        const phone = order.shippingPhone?.replace(/[^0-9]/g, '');
        if (phone) {
          const msg = `📦 *المريش شوب*\n\nتم تحديث حالة طلبك #${order.orderNumber}\n\nالحالة الجديدة: *${statusMap[updateData.status] || updateData.status}*\n\nشكراً لتسوقك معنا! 🛍️`;
          // إرسال عبر UltraMsg أو WA API مباشرة
          await fetch(`https://api.ultramsg.com/instance115925/messages/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: process.env.ULTRAMSG_TOKEN || '', to: phone, body: msg }),
          }).catch(() => {}); // تجاهل الخطأ إذا ما كان الـ API متاح
        }
      } catch { /* ignore whatsapp error */ }
    }

    // إنشاء إشعار عند تأكيد الدفع
    if (updateData.paymentStatus === 'paid' && oldOrder && oldOrder.paymentStatus !== 'paid') {
      await db.orderNotification.create({
        data: {
          orderId: id,
          userId: order.userId,
          type: 'payment_verified',
          title: 'تم تأكيد الدفع',
          message: `تم تأكيد دفع طلبك ${order.orderNumber} - سيتم البدء في تجهيز طلبك`,
        },
      });
    }

    // إنشاء إشعار عند رفض الدفع
    if (updateData.paymentStatus === 'rejected' && oldOrder && oldOrder.paymentStatus !== 'rejected') {
      await db.orderNotification.create({
        data: {
          orderId: id,
          userId: order.userId,
          type: 'payment_rejected',
          title: 'مرفوض إيصال الدفع',
          message: `لم يتم قبول إيصال دفع طلبك ${order.orderNumber} - يرجى التواصل معنا أو رفع إيصال جديد`,
        },
      });
    }

    return Response.json(order);
  } catch (error) {
    console.error('Order PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الطلب' }, { status: 500 });
  }
}
