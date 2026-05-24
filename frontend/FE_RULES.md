# Quy Tắc Phát Triển Frontend - Project datn_bac_cntt_k21

Tài liệu này quy định cấu trúc và các nguyên tắc làm việc cụ thể với phần Frontend của dự án này.

## 1. Cấu trúc thư mục (src/)

Dưới đây là sơ đồ cây thư mục và chức năng chi tiết của các thành phần hiện có:

```text
src/
├── api/             # Các hàm gọi API (Axios).
├── components/      # Component UI tái sử dụng.
│   ├── common/      # GỐC RỄ: Button.tsx, DataTable.tsx, Input.tsx, Modal.tsx.
│   ├── layouts/     # KHUNG: Header.tsx, Sidebar.tsx, MainLayout.tsx.
│   └── theme/       # GIAO DIỆN: ThemeToggle.tsx.
├── hooks/           # Custom Hooks xử lý logic.
├── pages/           # Các trang (Mỗi trang có thư mục components riêng).
│   ├── Dashboard/   # index.tsx
│   ├── Documents/   # index.tsx + components (DocumentTable.tsx, DocumentUpload.tsx)
│   ├── Generator/   # index.tsx + components (GeneratorForm.tsx)
│   ├── QuestionBank/# index.tsx + components (BankFilters.tsx, BankTable.tsx)
│   └── LoginPage.tsx# Trang login lẻ.
├── stores/          # Quản lý State (Zustand).
├── types/           # Định nghĩa TypeScript Interface.
├── App.tsx          # Cấu hình Routing.
├── main.tsx         # Entry point.
└── index.css        # Global CSS.
```

## 2. Quy tắc quản lý Component & Chỉnh sửa (NGHIÊM NGẶT)

1.  **Tiếp nhận cấu trúc**: Khi thực hiện task, AI phải tuân thủ đúng phân cấp thư mục trên. Tuyệt đối không tự ý thay đổi cấu trúc này.
2.  **Không tạo Component lung tung**: Trước khi tạo mới, phải kiểm tra `components/common/`. Nếu chức năng đã có (hoặc có thể mở rộng từ common), không được tạo thêm file mới.
3.  **KHÔNG SỬA GỐC RỄ**: Tuyệt đối không được sửa đổi nội dung của các component "gốc rễ" trong `src/components/common/` và `src/components/layouts/` nếu chưa hỏi ý kiến USER. Các component này là nền tảng của toàn bộ ứng dụng.
4.  **Phân vùng Component**: Component đặc thù của trang nào thì phải nằm trong thư mục `components` của trang đó (ví dụ: `pages/Generator/components/`). Không đưa component đặc thù vào `src/components/common`.
5.  **Hỏi trước khi sửa**: Nếu một task yêu cầu thay đổi logic tại các file "gốc rễ", AI phải trình bày phương án và đợi USER đồng ý mới được thực hiện.

## 3. Kiến trúc Luồng Dữ liệu (Frontend Data Flow)

Dự án tuân thủ nghiêm ngặt luồng dữ liệu theo trình tự sau:

1.  **Types (Định nghĩa)**: Mọi dữ liệu phải được định nghĩa interface/type tại `src/types/`. Đây là bước đầu tiên để đảm bảo tính nhất quán giữa BE và FE.
2.  **API (Giao tiếp)**: Sử dụng Axios Client tại `src/api/` để định nghĩa các hàm gọi API. Các hàm này sử dụng các `Types` đã định nghĩa ở bước 1.
3.  **Hooks (Logic xử lý)**: Sử dụng React Query (useQuery, useMutation) tại `src/hooks/` để bọc các hàm API. Hooks là nơi xử lý logic caching, loading, success/error toast.
4.  **Page (Điều phối)**: Các trang tại `src/pages/` sử dụng `Hooks` để lấy hoặc gửi dữ liệu. Page đóng vai trò điều phối chính và truyền dữ liệu xuống các component con.
5.  **Component (Hiển thị & Tương tác)**:
    - Nhận dữ liệu từ Page qua `props`.
    - Tương tác với người dùng.
    - **Component <-> Store**: Nếu cần quản lý trạng thái toàn cục (UI theme, Auth token, thông tin user), component sẽ tương tác trực tiếp với **Zustand Store** tại `src/stores/`.

---
> [!IMPORTANT]
> Việc tuân thủ "gốc rễ", cấu trúc thư mục và luồng dữ liệu trên là ưu tiên hàng đầu để giữ cho project sạch sẽ và ổn định.
