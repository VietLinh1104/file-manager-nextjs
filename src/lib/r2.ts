// src/lib/r2.ts
export interface R2ResponseBase {
  success?: boolean
  error?: string
}

export interface CreateMultipartUploadResponse extends R2ResponseBase {
  uploadId: string
  key: string
}

export interface SignPartResponse extends R2ResponseBase {
  url: string
}

export interface CompleteMultipartUploadResponse extends R2ResponseBase {
  key: string
  bucket: string
  url: string
  uploaded_at: string
}

export interface DeleteFileResponse extends R2ResponseBase {
  key: string
}

export interface DeleteListResponse extends R2ResponseBase {
  deleted: { Key: string }[]
  errors: { Key?: string; Code?: string; Message?: string }[]
}

// ✅ Định nghĩa riêng, không extends RequestInit
export interface FetchOptions<TBody> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: TBody
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
  cache?: RequestCache
  credentials?: RequestCredentials
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  integrity?: string
  keepalive?: boolean
}

// 🧩 Helper build query string
function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return ""
  const query = new URLSearchParams()
  for (const key in params) {
    const val = params[key]
    if (val !== undefined && val !== null) query.append(key, String(val))
  }
  return query.toString() ? `?${query.toString()}` : ""
}

const BASE_URL = "/api/multipart-upload"

/**
 * 🔹 Hàm fetch wrapper an toàn, type-safe, không dùng any
 */
export async function r2Fetch<TResponse, TBody = undefined>(
  endpoint: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "POST", body, params, headers, ...rest } = options

  const url = `${BASE_URL}/${endpoint}${buildQuery(params)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  console.log("[R2 REQUEST]", method, url, "body:", body)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...rest,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 API ${response.status}: ${text}`)
    }

    const data = (await response.json()) as TResponse
    console.log("[R2 RESPONSE]", endpoint, data)
    return data
  } catch (err) {
    console.error("[R2 ERROR]", err)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
