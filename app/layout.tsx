import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VirtualBoss Trainer - AIマルチエージェント上司対応訓練システム",
  description: "AIを活用した上司とのコミュニケーションスキル向上のための訓練システム",
  keywords: ["AI", "コミュニケーション", "訓練", "上司", "スキル向上"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
