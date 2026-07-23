-- Seed danh mục Xí nghiệp (16 đơn vị)
-- Chạy trên Supabase SQL Editor. An toàn chạy lại (upsert theo ma).

insert into public.xi_nghiep (ma, ten, phu_hop_tvtk, phu_hop_thi_nghiem, active)
values
  ('DVDL-BN',  'Xí nghiệp DVĐL Bắc Ninh',                          true,  true,  true),
  ('DVDL-CB',  'Xí nghiệp DVĐL Cao Bằng',                          true,  true,  true),
  ('DVDL-HT',  'Xí nghiệp DVĐL Hà Tĩnh',                           true,  true,  true),
  ('DVDL-HY',  'Xí nghiệp DVĐL Hưng Yên',                          true,  true,  true),
  ('DVDL-LC',  'Xí nghiệp DVĐL Lai Châu',                          true,  true,  true),
  ('DVDL-LK',  'Xí nghiệp DVĐL Lào Cai',                           true,  true,  true),
  ('DVDL-NA',  'Xí nghiệp DVĐL Nghệ An',                           true,  true,  true),
  ('DVDL-NB',  'Xí nghiệp DVĐL Ninh Bình',                         true,  true,  true),
  ('DVDL-PT',  'Xí nghiệp DVĐL Phú Thọ',                           true,  true,  true),
  ('DVDL-QN',  'Xí nghiệp DVĐL Quảng Ninh',                        true,  true,  true),
  ('DVDL-SL',  'Xí nghiệp DVĐL Sơn La',                            true,  true,  true),
  ('DVDL-TN',  'Xí nghiệp DVĐL Thái Nguyên',                       true,  true,  true),
  ('DVDL-TH',  'Xí nghiệp DVĐL Thanh Hóa',                         true,  true,  true),
  ('DVDL-TQ',  'Xí nghiệp DVĐL Tuyên Quang',                       true,  true,  true),
  ('TV',       'Xí nghiệp Tư vấn',                                 true,  false, true),
  ('XL-TN',    'Xí nghiệp Xây lắp, Sửa chữa và Thí nghiệm',        false, true,  true)
on conflict (ma) do update set
  ten = excluded.ten,
  phu_hop_tvtk = excluded.phu_hop_tvtk,
  phu_hop_thi_nghiem = excluded.phu_hop_thi_nghiem,
  active = excluded.active;
