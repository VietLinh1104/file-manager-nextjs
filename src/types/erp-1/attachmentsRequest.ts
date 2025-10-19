export interface attachmentsRequest {
  file_type?: string;
  file_path: string;
  key: string;
  file_size?: number;
  uploaded_at?: Date;
  file_name?: string;
  attachmentId?: string;
}