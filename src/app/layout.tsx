import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { AppDialogProvider } from "@/components/AppDialog";
import { AppLayout } from "@/components/AppLayout";
import { APP_TITLE } from "@/lib/brand";
import "./globals.css";

/** Sans gọn, hỗ trợ tiếng Việt tốt — tránh font quá đậm/dày */
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: APP_TITLE,
  description:
    "Giao nhiệm vụ Phòng chuyên môn: QĐ Giao A → danh mục dự án → QĐ giao Xí nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans font-normal tracking-normal">
        <AppDialogProvider>
          <AppLayout>{children}</AppLayout>
        </AppDialogProvider>
      </body>
    </html>
  );
}
