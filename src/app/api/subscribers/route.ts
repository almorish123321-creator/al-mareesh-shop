import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.email) {
      return Response.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }
    const subscriber = await db.subscriber.upsert({
      where: { email: data.email },
      update: { isActive: true },
      create: { email: data.email, isActive: true },
    });
    return Response.json({ success: true, id: subscriber.id });
  } catch (error) {
    console.error('Subscriber POST error:', error);
    return Response.json({ error: 'خطأ في الاشتراك' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await db.subscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(subscribers);
  } catch (error) {
    console.error('Subscribers GET error:', error);
    return Response.json({ error: 'خطأ في جلب المشتركين' }, { status: 500 });
  }
}
