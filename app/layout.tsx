import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AITuber Sandbox",
  description: "YouTube Live Chat シミュレータ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="border-b border-border">
          <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <a href="/" className="text-lg font-bold text-primary">
              AITuber Sandbox
            </a>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                ダッシュボード
              </a>
              <a href="/rooms" className="text-sm text-muted-foreground hover:text-foreground">
                ルーム
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
