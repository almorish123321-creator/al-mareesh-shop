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
        include: { items: true },
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

    // Handle guest users - find or create a guest user
    let userId = data.userId;
    if (!userId || userId === 'guest') {
      // Find existing guest user or create one
      let guestUser = await db.user.findFirst({ where: { email: 'guest@mareesh.com' } });
      if (!guestUser) {
        guestUser = await db.user.create({
          data: {
            email: `guest-${Date.now()}@mareesh.com`,
            name: data.shippingName || 'ضيف',
            password: Buffer.from('guest').toString('base64'),
            phone: data.shippingPhone || '',
            role: 'customer',
            isActive: true,
          },
        });
      }
      userId = guestUser.id;
    }

    // Validate that all productIds exist
    const items = data.items || [];
    const validItems = [];
    for (const item of items) {
      // Check if product exists
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
        // Product not found - create a generic item with just the name
        validItems.push({
          productId: item.productId,
          name: item.name || 'منتج محذوف',
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

    // Calculate totals on server side for accuracy
    const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: 'pending',
        paymentMethod: data.paymentMethod || 'cod',
        paymentStatus: 'unpaid',
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
      },
      include: { items: true },
    });

    // Update product stock for valid products only
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
      } catch {
        // Skip stock update if product not found
      }
    }

    console.log(`✅ Order created: ${orderNumber} - ${validItems.length} items - Total: ${order.total}`);

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
    const { id, _count, createdAt, updatedAt, items, user, ...updateData } = data;
    if (!id) return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });
    return Response.json(order);
  } catch (error) {
    console.error('Order PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الطلب' }, { status: 500 });
  }
}
