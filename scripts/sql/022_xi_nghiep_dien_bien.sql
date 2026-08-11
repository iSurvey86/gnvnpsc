-- [ĐÃ THAY] XN Điện Biên đã sáp nhập vào Lai Châu — không kích hoạt lại.
-- Dùng SQL 023_an_xn_sap_nhap.sql. File này giữ để tránh chạy nhầm bản cũ.

insert into public.xi_nghiep (ma, ten, phu_hop_tvtk, phu_hop_thi_nghiem, active)
values (
  'DVDL-DB',
  'Xí nghiệp DVĐL Điện Biên',
  true,
  true,
  false
)
on conflict (ma) do update set
  ten = excluded.ten,
  phu_hop_tvtk = excluded.phu_hop_tvtk,
  phu_hop_thi_nghiem = excluded.phu_hop_thi_nghiem,
  active = false;
