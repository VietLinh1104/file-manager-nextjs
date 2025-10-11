declare module '@uppy/aws-s3-multipart' {
  import type { Plugin, Uppy, UppyFile } from '@uppy/core'

  // Kiểu response tối thiểu khi ký tham số upload (nếu bạn dùng chế độ custom)
  export interface UploadParameters {
    method: 'PUT' | 'POST'
    url: string
    headers?: Record<string, string>
    fields?: Record<string, string>
  }

  export interface AwsS3MultipartOptions {
    /**
     * URL API backend (companion) để ký multipart: /api/upload
     */
    companionUrl?: string
    companionHeaders?: Record<string, string>
    /**
     * Giới hạn số request song song khi upload các part
     */
    limit?: number
    /**
     * Thời gian timeout mỗi request (ms)
     */
    timeout?: number
    /**
     * (Tuỳ chọn, hiếm khi cần với Multipart)
     * Trường hợp bạn tự ký từng request thay vì dùng companion endpoints chuẩn
     */
    getUploadParameters?: (file: UppyFile) => Promise<UploadParameters>
  }

  export default class AwsS3Multipart extends Plugin {
    constructor(uppy: Uppy, opts?: AwsS3MultipartOptions)
  }
}
