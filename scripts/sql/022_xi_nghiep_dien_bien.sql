-- Bổ sung Xí nghiệp DVĐL Điện Biên (thiếu trong seed 004).
-- Chạy trên Supabase SQL Editor. An toàn chạy lại (upsert theo ma).

insert into public.xi_nghiep (ma, ten, phu_hop_tvtk, phu_hop_thi_nghiem, active)
values (
  'DVDL-DB',
  'Xí nghiệp DVĐL Điện Biên',
  true,
  true,
  true
)
on conflict (ma) do update set
  ten = excluded.ten,
  phu_hop_tvtk = excluded.phu_hop_tvtk,
  phu_hop_thi_nghiem = excluded.phu_hop_thi_nghiem,
  active = excluded.active;

-- Nếu đã có cột phu_hop_tvgs (SQL 012): bật phù hợp TVGS
do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'xi_nghiep'
       and column_name = 'phu_hop_tvgs'
  ) then
    update public.xi_nghiep
       set phu_hop_tvgs = true
     where ma = 'DVDL-DB';
  end if;
end $$;
