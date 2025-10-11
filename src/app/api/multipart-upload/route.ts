import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// 🔹 Đọc biến môi trường
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('❌ Missing Cloudflare R2 environment variables')
}

// 🔹 Tạo client S3 tương thích Cloudflare R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})

// 🔹 Hàm POST (chuẩn App Router)
export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json()

    const signedUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `resources/${filename}`,
        ContentType: contentType || 'application/octet-stream',
      }),
      { expiresIn: 3600 } // 1 giờ
    )

    return NextResponse.json({
      url: signedUrl,
      method: 'PUT',
    })
  } catch (err) {
    console.error('❌ Signed URL error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
