import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;

    const now = new Date();
    const startDate = new Date();
    
    if (period === 'daily') {
      startDate.setDate(now.getDate() - days);
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - days * 7);
    } else {
      startDate.setMonth(now.getMonth() - days);
    }

    // جلب كل الطلبات في الفترة
    const orders = await db.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    // إحصائيات عامة
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // تقسيم حسب الفترة
    const revenueByPeriod: Record<string, { revenue: number; orders: number; items: number }> = {};
    
    for (const order of orders) {
      let key: string;
      const d = new Date(order.createdAt);
      if (period === 'daily') {
        key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'weekly') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!revenueByPeriod[key]) {
        revenueByPeriod[key] = { revenue: 0, orders: 0, items: 0 };
      }
      revenueByPeriod[key].revenue += order.total;
      revenueByPeriod[key].orders += 1;
      revenueByPeriod[key].items += order.items.reduce((sum, i) => sum + i.quantity, 0);
    }

    // أكثر المنتجات مبيعاً
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders.filter(o => o.status !== 'cancelled')) {
      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // طرق الدفع
    const paymentMethods: Record<string, { count: number; revenue: number }> = {};
    for (const order of orders.filter(o => o.status !== 'cancelled')) {
      const method = order.paymentMethod || 'cod';
      if (!paymentMethods[method]) paymentMethods[method] = { count: 0, revenue: 0 };
      paymentMethods[method].count += 1;
      paymentMethods[method].revenue += order.total;
    }

    // المدن
    const cities: Record<string, { count: number; revenue: number }> = {};
    for (const order of orders.filter(o => o.status !== 'cancelled')) {
      const city = order.shippingCity || 'غير محدد';
      if (!cities[city]) cities[city] = { count: 0, revenue: 0 };
      cities[city].count += 1;
      cities[city].revenue += order.total;
    }

    return Response.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        conversionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      },
      revenueByPeriod,
      topProducts,
      paymentMethods,
      cities,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  } catch (error) {
    console.error('Reports GET error:', error);
    return Response.json({ error: 'خطأ في جلب التقارير' }, { status: 500 });
  }
}
