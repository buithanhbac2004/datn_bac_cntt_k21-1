import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react'; // Thêm Loader2 để làm icon loading

interface DocumentUploadProps {
  onFilesAccepted: (files: File[]) => void;
  disabled?: boolean; // Thêm prop disabled
}

export const DocumentUpload = ({ onFilesAccepted, disabled }: DocumentUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Nếu không bị disabled thì mới cho phép nhận file
    if (acceptedFiles.length > 0 && !disabled) {
      onFilesAccepted(acceptedFiles);
    }
  }, [onFilesAccepted, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled, // Vô hiệu hóa dropzone khi đang upload
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true // Cho phép chọn nhiều file cùng lúc
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-2xl transition-all duration-200 bg-surface group
        ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'}
        ${isDragActive
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
    >
      <input {...getInputProps()} />

      <div className={`p-4 rounded-full mb-4 transition-colors 
        ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}
        ${disabled ? 'bg-muted text-muted-foreground' : ''}
      `}>
        {/* Nếu đang upload thì hiện icon xoay tròn, không thì hiện icon mây */}
        {disabled ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <UploadCloud className="w-8 h-8" />
        )}
      </div>

      <p className="mb-2 text-lg font-semibold text-foreground text-center">
        {disabled
          ? 'Đang tải tài liệu lên hệ thống...'
          : isDragActive ? 'Thả file vào đây...' : 'Kéo thả tài liệu vào đây hoặc click để chọn file'
        }
      </p>

      <p className="text-sm text-muted-foreground text-center">
        {disabled ? 'Vui lòng đợi trong giây lát' : 'Hỗ trợ các định dạng: .PDF, .DOCX, .DOC, .TXT (Tối đa 6MB)'}
      </p>

      {/* Overlay hiệu ứng khi đang upload */}
      {disabled && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-2xl" />
      )}
    </div>
  );
};