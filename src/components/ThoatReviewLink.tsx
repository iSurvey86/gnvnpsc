"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { xinPhepRoiTrang } from "@/lib/roi-trang-guard";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Nút thoát màn Review — hỏi lại nếu bản quét chưa được lưu */
export function ThoatReviewLink({ href, className, children }: Props) {
  const router = useRouter();
  const [dangHoi, setDangHoi] = useState(false);

  return (
    <button
      type="button"
      disabled={dangHoi}
      onClick={async () => {
        setDangHoi(true);
        try {
          const duocPhep = await xinPhepRoiTrang();
          if (duocPhep) router.push(href);
        } finally {
          setDangHoi(false);
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
