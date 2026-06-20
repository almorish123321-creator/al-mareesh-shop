import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const sliders = await db.slider.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return Response.json(sliders);
  } catch (error) {
    console.error('Sliders GET error:', error);
    return Response.json({ error: 'خطأ في جلب السلايدرات' }, { status: 500 });
  }
}
