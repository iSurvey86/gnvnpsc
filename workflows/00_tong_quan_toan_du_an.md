# Workflow 00 — Sơ đồ tổng thể các module

> **Mục đích:** Nhìn nhanh cấu trúc module toàn hệ thống. Chi tiết từng luồng xem ở các workflow `01`–`03`.

## Sơ đồ phân rã module

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Root(["🏢 Hệ thống Giao nhiệm vụ - Phòng Kinh doanh"])

  DangNhap["🔑 Đăng nhập"]
  ChonPhanHe["🧭 Chọn phân hệ"]
  NghiepVu["📋 Nghiệp vụ theo phân hệ"]
  HeThong["⚙️ Quản lý hệ thống"]
  TaiKhoan["👤 Tài khoản cá nhân"]

  TVTK["Tư vấn thiết kế"]
  TN["Thí nghiệm hiệu chỉnh"]
  TVGS["Tư vấn giám sát"]

  NhapDuAn["📄 Nhập & quét Giao A"]
  QuanLyDuAn["🗂️ Quản lý dự án"]
  GiaoNhiemVu["✍️ Giao nhiệm vụ Xí nghiệp"]
  XuatWord["📤 Xuất văn bản Word"]

  NhatKy["🕵️ Nhật ký hoạt động"]
  NhanSu["👥 Quản lý nhân sự & tổ"]
  XiNghiep["🏭 Danh mục Xí nghiệp"]

  Root --> DangNhap --> ChonPhanHe
  ChonPhanHe --> NghiepVu
  ChonPhanHe --> HeThong
  ChonPhanHe --> TaiKhoan

  NghiepVu --> TVTK
  NghiepVu --> TN
  NghiepVu --> TVGS

  TVTK -.-> NhapDuAn
  TN -.-> NhapDuAn
  TVGS -.-> NhapDuAn
  NhapDuAn --> QuanLyDuAn --> GiaoNhiemVu --> XuatWord

  HeThong --> NhatKy
  HeThong --> NhanSu
  HeThong --> XiNghiep

  class Root,ChonPhanHe userClass
  class DangNhap,TaiKhoan processClass
  class NghiepVu,TVTK,TN,TVGS aiClass
  class NhapDuAn,QuanLyDuAn,GiaoNhiemVu,XuatWord dbClass
  class HeThong,NhatKy,NhanSu,XiNghiep exportClass
```

## Tóm tắt khối chức năng

| Khối | Module con | Vai trò |
|---|---|---|
| Đăng nhập | — | Xác thực người dùng, mở phiên làm việc |
| Chọn phân hệ | TVTK · TN · TVGS | Cửa vào ba tổ nghiệp vụ |
| Nghiệp vụ theo phân hệ | Nhập & quét Giao A · Quản lý dự án · Giao nhiệm vụ · Xuất Word | Luồng chính của mỗi tổ |
| Quản lý hệ thống | Nhật ký · Nhân sự & tổ · Xí nghiệp | Quản trị và truy vết |
| Tài khoản cá nhân | — | Thông tin cá nhân, đổi mật khẩu |

## Workflow chi tiết

- [01 — Nhập dự án từ Giao A](./01_nhap_du_an.md)
- [02 — Giao nhiệm vụ theo dự án](./02_giao_nhiem_vu.md)
- [03 — Giám sát hoạt động và tài khoản](./03_giam_sat_he_thong.md)
