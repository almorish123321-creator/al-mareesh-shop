import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    return Response.json(settingsMap);
  } catch (error) {
    console.error('Settings GET error:', error);
    return Response.json({ error: 'خطأ في جلب الإعدادات' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    for (const [key, value] of Object.entries(data)) {
      await db.setting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return Response.json({ error: 'خطأ في تحديث الإعدادات' }, { status: 500 });
  }
}
