import { GoogleGenAI } from "@google/genai";
import type { GiaoAScanResult } from "./types";

const MODEL = "gemini-3.5-flash-lite";

/**
 * Stub ScanAI — parse PDF QĐ Giao A → JSON danh mục dự án.
 * Cần GEMINI_API_KEY + mẫu PDF thật để tinh chỉnh schema.
 */
export async function parseGiaoAPdf(pdfBytes: Buffer): Promise<GiaoAScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64 = pdfBytes.toString("base64");

  const interaction = await ai.interactions.create({
    model: MODEL,
    system_instruction:
      "Bạn trích xuất Quyết định Giao A thành JSON. Chỉ trả JSON hợp lệ, không markdown.",
    input: [
      {
        type: "text",
        text: `Trả JSON đúng schema:
{
  "so_qd": string | null,
  "ngay_qd": "YYYY-MM-DD" | null,
  "trich_yeu": string | null,
  "du_an": [{ "ma_du_an", "ten_du_an", "dia_diem", "quy_mo", "goi_cong_viec", "cap_dien_ap": "110kv" | "trung_ha_ap" | null }]
}`,
      },
      {
        type: "document",
        data: base64,
        mime_type: "application/pdf",
      },
    ],
    generation_config: {
      thinking_level: "minimal",
    },
  });

  const text = interaction.output_text?.trim();
  if (!text) {
    throw new Error("ScanAI không trả text");
  }

  const parsed = JSON.parse(stripFences(text)) as GiaoAScanResult;
  if (!Array.isArray(parsed.du_an)) {
    parsed.du_an = [];
  }
  return parsed;
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
