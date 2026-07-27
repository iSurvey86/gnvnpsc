/**
 * Cấp Auth cho mọi dòng nhan_su đang active.
 * Admin → Admin@123 (hoặc DEFAULT_ADMIN_PASSWORD)
 * User  → Gnvnpsc@2026 (hoặc DEFAULT_USER_PASSWORD)
 * Chạy: npm run seed:auth
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userPassword =
  process.env.DEFAULT_USER_PASSWORD?.trim() || "Gnvnpsc@2026";
const adminPassword =
  process.env.DEFAULT_ADMIN_PASSWORD?.trim() || "Admin@123";

if (!url || !key) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findAuthUserIdByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

function passwordFor(ns) {
  return ns.vai_tro === "admin" ? adminPassword : userPassword;
}

async function main() {
  // Đảm bảo có dòng Admin (cần đã chạy SQL 007 — cột vai_tro)
  const { error: upsertAdminErr } = await supabase.from("nhan_su").upsert(
    {
      ma_nv: "ADMIN",
      ho_ten: "Quản trị hệ thống",
      email: "admin@gnvnpsc.local",
      don_vi: "Quản trị hệ thống",
      chuc_danh: "Admin",
      active: true,
      vai_tro: "admin",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (upsertAdminErr) {
    console.error(
      "Không ghi được Admin — chạy SQL 007_admin_vai_tro.sql trước:",
      upsertAdminErr.message,
    );
    process.exit(1);
  }

  const { data: rows, error } = await supabase
    .from("nhan_su")
    .select("*")
    .eq("active", true)
    .order("ma_nv", { ascending: true });

  if (error) throw error;
  if (!rows?.length) {
    console.log("Không có nhân sự — chạy SQL 005 + 006 + 007 trước.");
    return;
  }

  console.log(`Cấp Auth cho ${rows.length} dòng…`);

  for (const ns of rows) {
    const email = String(ns.email).trim().toLowerCase();
    const password = passwordFor(ns);
    const vaiTro = ns.vai_tro === "admin" ? "admin" : "user";
    let authUserId = ns.auth_user_id;

    const meta = {
      user_metadata: {
        ho_ten: ns.ho_ten,
        ma_nv: ns.ma_nv,
        goi_y_doi_mk: true,
        vai_tro: vaiTro,
      },
      app_metadata: { vai_tro: vaiTro },
    };

    try {
      if (authUserId) {
        const { error: updErr } = await supabase.auth.admin.updateUserById(
          authUserId,
          {
            password,
            email,
            email_confirm: true,
            ...meta,
          },
        );
        if (updErr) throw updErr;
      } else {
        const { data: created, error: createErr } =
          await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            ...meta,
          });

        if (createErr) {
          const existing = await findAuthUserIdByEmail(email);
          if (!existing) throw createErr;
          authUserId = existing;
          const { error: updErr } = await supabase.auth.admin.updateUserById(
            authUserId,
            {
              password,
              email_confirm: true,
              ...meta,
            },
          );
          if (updErr) throw updErr;
        } else {
          authUserId = created.user.id;
        }
      }

      const { error: linkErr } = await supabase
        .from("nhan_su")
        .update({
          auth_user_id: authUserId,
          da_cap_dang_nhap: true,
          goi_y_doi_mk: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ns.id);

      if (linkErr) throw linkErr;
      console.log(`OK  [${vaiTro}] ${email}`);
    } catch (e) {
      console.error(`FAIL ${email}:`, e.message || e);
    }
  }

  console.log("Xong.");
  console.log(`Admin: admin@gnvnpsc.local / ${adminPassword}`);
  console.log(`User:  (email PKD) / ${userPassword}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
