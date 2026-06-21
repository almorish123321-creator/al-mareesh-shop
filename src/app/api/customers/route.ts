import { db } from '@/lib/db';

// GET /api/customers - Admin: list all customers with order stats
export async function GET() {
  try {
    const customers = await db.user.findMany({
      where: { role: 'customer' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = customers.map(c => ({
      ...c,
      totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
      lastOrderTotal: c.orders[0]?.total || 0,
      orderCount: c._count.orders,
    }));

    return Response.json(enriched);
  } catch (error) {
    console.error('Customers GET error:', error);
    return Response.json({ error: 'خطأ في جلب العملاء' }, { status: 500 });
  }
}
