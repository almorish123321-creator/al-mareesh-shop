import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'products';
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح به (JPEG, PNG, WebP, GIF فقط)' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً (الحد 5MB)' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with optimization
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `al-mareesh/${folder}`,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          // Generate multiple sizes for product images
          eager: [
            { width: 800, height: 1000, crop: 'limit', quality: 'auto:good' },
            { width: 300, height: 300, crop: 'thumb', quality: 'auto:good' },
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const uploadResult = result as any;
    
    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'خطأ في رفع الملف' },
      { status: 500 }
    );
  }
}

// DELETE - Remove image from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    
    if (!publicId) {
      return NextResponse.json({ error: 'معرف الصورة مطلوب' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'خطأ في حذف الصورة' }, { status: 500 });
  }
}
