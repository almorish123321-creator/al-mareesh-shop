import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(messages);
  } catch (error) {
    console.error('Contact GET error:', error);
    return Response.json({ error: 'خطأ في جلب الرسائل' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.email || !data.message) {
      return Response.json({ error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });
    }
    const message = await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
        isRead: false,
      },
    });
    return Response.json({ success: true, id: message.id });
  } catch (error) {
    console.error('Contact POST error:', error);
    return Response.json({ error: 'خطأ في إرسال الرسالة' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return Response.json({ error: 'معرف الرسالة مطلوب' }, { status: 400 });
    const message = await db.contactMessage.update({ where: { id }, data: updateData });
    return Response.json(message);
  } catch (error) {
    console.error('Contact PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الرسالة' }, { status: 500 });
  }
}
