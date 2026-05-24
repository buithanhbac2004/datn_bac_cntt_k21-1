export interface DocumentRequest {
  user_id: number;
  file_name: string;
  file_path: string;
  file_ext: string; // đuôi định dạng tệp (pdf, docx, ...)
  file_size: number;
  processing_status: 'Đang chờ' | 'Đang xử lí' | 'Hoàn thành'; // Dùng Union Type cho chính xác trạng thái
}

export interface DocumentResponse {
  id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_ext: string;
  file_size: number;
  processing_status: 'Đang chờ' | 'Đang xử lí' | 'Hoàn thành';
  created_at: string; // Backend gửi datetime thì FE nhận về sẽ là chuỗi ISO string
}


export interface DocumentFilter {
  file_name?: string | null;
  status?: 'Đang chờ' | 'Đang xử lí' | 'Hoàn thành' | null;
  limit?: number;
  offset?: number;
}