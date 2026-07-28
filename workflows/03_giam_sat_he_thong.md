# Workflow — Giám sát hoạt động & danh sách tài khoản

> **Màn hình:** Giám sát hoạt động (Admin) / Danh sách tài khoản (user)  
> **Route:** `/he-thong/giam-sat` · `/he-thong/tai-khoan`

## Luồng nghiệp vụ

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Start(["👤 Đăng nhập"])
  Role{"Là Admin?"}
  Hub["Mở Quản lý hệ thống — Giám sát hoạt động"]
  Side["Sidebar — Danh sách tài khoản"]
  Tabs{"Chọn tab"}
  Logs["Xem nhật ký · lọc · xuất CSV"]
  Acc["Danh sách tài khoản non-admin"]
  Sort["Sắp theo mã NV tăng dần"]
  Cap{"Admin muốn cấp login?"}
  CapBtn["Cấp đăng nhập hoặc đặt lại mật khẩu"]
  LogCap["Ghi nhật ký cấp tài khoản"]
  Footer(["Bấm avatar — Tài khoản / Đăng xuất"])
  Me["Trang Tài khoản — họ tên · email · đổi MK"]

  Start --> Role
  Role -->|Có| Hub --> Tabs
  Role -->|Không| Side --> Acc
  Tabs -->|Nhật ký| Logs
  Tabs -->|Tài khoản| Acc --> Sort
  Acc --> Cap
  Cap -->|Có| CapBtn --> LogCap
  Cap -->|Không| Footer
  Logs --> Footer
  LogCap --> Footer
  Footer --> Me

  class Start,Hub,Side,Acc,Footer,Me userClass
  class Role,Tabs,Cap,Sort,CapBtn processClass
  class LogCap dbClass
  class Logs exportClass
```

## Nội dung màn hình

| Vai trò | Nội dung |
|---------|----------|
| Admin | Tab Nhật ký hoạt động + Danh sách tài khoản; thao tác cấp / đặt lại MK |
| User thường | Chỉ danh sách tài khoản (không tab nhật ký); sidebar mục «Danh sách tài khoản» |
| Avatar sidebar | Hiện họ tên; menu: Tài khoản · Đăng xuất |
| Tài khoản | Họ và tên · Email · đổi MK (tùy chọn) — không hiện User ID |

## Cột danh sách tài khoản

| Cột | Ghi chú |
|-----|---------|
| Mã NV | Sắp tăng dần (KD01…KD17) |
| Họ tên | |
| Email | |
| Số điện thoại | |
| Thao tác | Chỉ Admin — Cấp đăng nhập / Đặt lại MK |

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| SQL | `scripts/sql/010_nhat_ky_hoat_dong.sql` → bảng `nhat_ky_hoat_dong` |
| Logger | `src/lib/activity-log.ts` — login / logout / cấp TK |
| API | `GET/POST /api/nhat-ky` · `GET /api/tai-khoan` |
| UI | `GiamSatHeThongClient.tsx` · `SidebarUserFooter.tsx` |
