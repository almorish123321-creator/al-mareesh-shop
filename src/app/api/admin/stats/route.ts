import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.user.count({ where: { role: 'customer' } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    ]);

    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true },
    });

    const ordersByStatus = await db.order.groupBy({ by: ['status'], _count: true });
    const topProducts = await db.product.findMany({
      where: { isActive: true },
      orderBy: { totalSold: 'desc' },
      take: 5,
      include: { category: true },
    });

    const monthlySales = await db.$queryRaw`
      SELECT strftime('%Y-%m', createdAt) as month, SUM(total) as revenue, COUNT(*) as orders
      FROM \`Order\` WHERE status != 'cancelled'
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC LIMIT 12
    `;

    return Response.json({
      totalProducts, totalOrders, totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders, ordersByStatus, topProducts, monthlySales,
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return Response.json({ error: 'خطأ في جلب الإحصائيات' }, { status: 500 });
  }
}
