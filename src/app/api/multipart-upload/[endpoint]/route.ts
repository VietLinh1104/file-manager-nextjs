import { NextResponse } from 'next/server'
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  type CompletedPart,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// 🔹 Biến môi trường R2
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } = process.env

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_KEY_ID || !R2_BUCKET_NAME) {
  throw new Error('❌ Missing Cloudflare R2 environment variables')
}

// 🔹 Client R2 (S3-compatible)
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_KEY_ID!,
  },
  forcePathStyle: true,
})

// 🔹 Helper đọc JSON body
async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    return {} as T
  }
}

// ===================================================================
// 🔹 API HANDLER CHÍNH
// ===================================================================
export async function POST(request: Request, context: { params: { endpoint: string } }) {
  const { endpoint } = context.params

  try {
    switch (endpoint) {
      // 🧩 1️⃣ Tạo multipart upload
      case 'create-multipart-upload': {
        // 🪄 FIX: Nhận đúng field từ frontend (fileName, contentType)
        const { fileName, contentType } = await readJson<{ fileName: string; contentType: string }>(request)

        if (!fileName) {
          return NextResponse.json({ error: 'Missing fileName' }, { status: 400 })
        }

        // Tạo key chuẩn không còn “undefined”
        const key = `resources/${Date.now()}-${fileName}`

        const cmd = new CreateMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          ContentType: contentType ?? 'application/octet-stream',
        })

        const resp = await s3.send(cmd)
        return NextResponse.json({
          uploadId: resp.UploadId,
          key: resp.Key,
        })
      }

      // 🧩 2️⃣ Ký URL cho từng part
      case 'sign-part': {
        const { key, uploadId, partNumber } = await readJson<{ key: string; uploadId: string; partNumber: number }>(
          request
        )
        const cmd = new UploadPartCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: Number(partNumber),
        })
        const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 })
        return NextResponse.json({ url })
      }

      // 🧩 3️⃣ Danh sách part đã upload
      case 'list-parts': {
        const { key, uploadId } = await readJson<{ key: string; uploadId: string }>(request)
        const cmd = new ListPartsCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
        })
        const resp = await s3.send(cmd)
        return NextResponse.json(resp.Parts ?? [])
      }

      // 🧩 4️⃣ Hoàn tất multipart upload
      case 'complete-multipart-upload': {
        const { key, uploadId, parts } = await readJson<{ key: string; uploadId: string; parts: CompletedPart[] }>(
          request
        )

        const cmd = new CompleteMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const resp = await s3.send(cmd)

        // ⚙️ Chuẩn hóa dữ liệu trả về frontend
        return NextResponse.json({
          success: true,
          key,
          bucket: R2_BUCKET_NAME,
          url: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${encodeURIComponent(key)}`,
          uploaded_at: new Date().toISOString(),
        })
      }

      // 🧩 5️⃣ Hủy multipart upload
      case 'abort-multipart-upload': {
        const { key, uploadId } = await readJson<{ key: string; uploadId: string }>(request)
        const cmd = new AbortMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
        })
        await s3.send(cmd)
        return NextResponse.json({ success: true })
      }

      case 'delete-file': {
        const { key } = await readJson<{ key: string }>(request)

        if (!key) {
          return NextResponse.json({ error: 'Missing key' }, { status: 400 })
        }

        try {
          // Dùng DeleteObjectCommand để xóa file
          const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
          const cmd = new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
          })
          await s3.send(cmd)
          return NextResponse.json({ success: true, key })
        } catch (error) {
          console.error('❌ Lỗi khi xóa file:', error)
          return NextResponse.json({ error: 'Không thể xóa file trên R2' }, { status: 500 })
        }
      }

      // 🧩 Endpoint không hợp lệ
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    }
  } catch (err) {
    console.error('❌ Upload error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
