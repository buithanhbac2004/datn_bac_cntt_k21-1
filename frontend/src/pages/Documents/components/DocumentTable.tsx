import { useMemo } from 'react';
import { FileText, FileBadge, CheckCircle, Clock } from 'lucide-react';
import DataTable, { type ColumnDef } from '@/components/common/DataTable';
// Thêm chữ type để hết lỗi đỏ dòng 4
import type { DocumentResponse } from '@/types/document';


interface DocumentTableProps {
  documents: DocumentResponse[];
  getViewUrl: (id: number) => any;
}

// Hàm format size viết ngay trong component cho tiện
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentTable = ({ documents, getViewUrl }: DocumentTableProps) => {

  const columns = useMemo<ColumnDef<DocumentResponse>[]>(
    () => [
      {
        id: 'file_name',
        header: 'Tên tài liệu',
        accessorKey: 'file_name',
        cell: (item: DocumentResponse) => (
          <div className="flex items-center gap-3 max-w-[300px] sm:max-w-sm md:max-w-md">
            {item.file_ext?.toLowerCase() === '.pdf' ? (
              <FileBadge className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            {/* Chuyển thành button với style hover và gạch chân */}
            <button
              onClick={async () => {
                const { url, isViewer } = await getViewUrl(item.id);

                if (isViewer) {
                  // 👉 dùng Microsoft Viewer
                  const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + url)}`;
                  window.open(viewerUrl, '_blank');
                } else {
                  window.open(url, '_blank');
                }
              }}
              className="font-medium text-foreground truncate hover:text-primary hover:underline transition-colors text-left"
              title={`Mở tài liệu: ${item.file_name}`}
            >
              {item.file_name}
            </button>
          </div>
        ),
      },
      {
        id: 'file_size',
        header: 'Kích thước',
        accessorKey: 'file_size',
        cell: (item: DocumentResponse) => (
          <span className="text-sm text-muted-foreground">
            {formatFileSize(item.file_size)}
          </span>
        ),
      },
      {
        id: 'processing_status',
        header: 'Trạng thái',
        accessorKey: 'processing_status',
        cell: (item: DocumentResponse) => (
          item.processing_status === 'Hoàn thành' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Đã trích xuất
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> {item.processing_status}
            </span>
          )
        ),
      },
      {
        id: 'created_at',
        header: 'Ngày tải lên',
        accessorKey: 'created_at',
        cell: (item: DocumentResponse) => (
          <span className="text-sm text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
    ],
    [getViewUrl]
  );

  return (
    <div className="flex-1 flex flex-col h-full min-h-[400px]">
      <DataTable<DocumentResponse>
        title={`Tài liệu đã tải lên (${documents.length} File)`}
        columns={columns}
        data={documents}
        enableSelection={false} 
        // onSelectionChange={(selectedIds: string[]) => {
        //   console.log("Các ID đã chọn:", selectedIds);
        // }}
        getRowId={(item: DocumentResponse) => item.id.toString()} 
      />
    </div>
  );
};