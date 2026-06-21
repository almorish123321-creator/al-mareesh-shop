import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'يجب اختيار ملف صورة فقط' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // If Cloudinary is configured, upload there
    if (cloudName && apiKey && apiSecret) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', `data:${file.type};base64,${buffer.toString('base64')}`);
      uploadFormData.append('upload_preset', 'mareesh_shop');
      uploadFormData.append('folder', 'mareesh-shop/products');

      const timestamp = Math.round(new Date().getTime() / 1000);
      uploadFormData.append('timestamp', timestamp.toString());

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        console.error('Cloudinary upload error');
        // Fallback to base64
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
        return Response.json({ url: base64 });
      }

      const data = await res.json();
      return Response.json({ url: data.secure_url });
    }

    // Fallback: Convert to base64 data URL (works without Cloudinary)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Url = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    return Response.json({ url: base64Url });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'خطأ في رفع الصورة' }, { status: 500 });
  }
}
