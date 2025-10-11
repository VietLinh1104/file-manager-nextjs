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

// 🔹 Đọc biến môi trường
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } =
  process.env

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_KEY_ID || !R2_BUCKET_NAME) {
  throw new Error('❌ Missing Cloudflare R2 environment variables')
}

// 🔹 Khởi tạo client R2 (S3-compatible)
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_KEY_ID,
  },
  forcePathStyle: true,
})

// 🔹 Helper: đọc JSON body
async function readJson<T>(req: Request): Promise<T> {
  try {
    return await req.json() as T
  } catch {
    return {} as T
  }
}

// 🔹 Route handler chính
export async function POST(request: Request, context: { params: { endpoint: string } }) {
  const { endpoint } = context.params

  try {
    switch (endpoint) {
      // 🧩 Tạo multipart upload
      case 'create-multipart-upload': {
        const { file, contentType } = await readJson<{ file: { name: string }, contentType: string }>(request)
        const key = `resources/${Date.now()}-${file?.name}`
        const cmd = new CreateMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          ContentType: contentType ?? 'application/octet-stream',
        })
        const resp = await s3.send(cmd)
        return NextResponse.json({ uploadId: resp.UploadId, key: resp.Key })
      }

      // 🧩 Ký từng part
      case 'sign-part': {
        const { key, uploadId, partNumber } = await readJson<{ key: string, uploadId: string, partNumber: number }>(request)
        const cmd = new UploadPartCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: Number(partNumber),
        })
        const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 })
        return NextResponse.json({ url })
      }

      // 🧩 Danh sách part đã upload
      case 'list-parts': {
        const { key, uploadId } = await readJson<{ key: string, uploadId: string }>(request)
        const cmd = new ListPartsCommand({ Bucket: R2_BUCKET_NAME, Key: key, UploadId: uploadId })
        const resp = await s3.send(cmd)
        return NextResponse.json(resp.Parts ?? [])
      }

      // 🧩 Hoàn tất upload
      case 'complete-multipart-upload': {
        const { key, uploadId, parts } = await readJson<{ key: string, uploadId: string, parts: CompletedPart[] }>(request)
        const cmd = new CompleteMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        })
        const resp = await s3.send(cmd)
        return NextResponse.json({
          success: true,
          key,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          location: (resp as any)?.Location ?? key,
        })
      }

      // 🧩 Hủy upload
      case 'abort-multipart-upload': {
        const { key, uploadId } = await readJson<{ key: string, uploadId: string }>(request)
        const cmd = new AbortMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
        })
        await s3.send(cmd)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    }
  } catch (err) {
    console.error('❌ Upload error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
