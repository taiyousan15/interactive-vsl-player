import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"
import "./globals.css"

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
})

export const metadata: Metadata = {
  title: "孫正義が予見するAI1万倍の世界 - 四次元ポケットシステム",
  description:
    "視聴者の選択によってストーリーが分岐するインタラクティブVSL。次世代AI四次元ポケットシステムの全貌を無料セミナーで公開。",
  openGraph: {
    title: "孫正義が予見するAI1万倍の世界 - 四次元ポケットシステム",
    description: "あなたの選択で変わるストーリー。LINE登録で無料セミナーに参加。",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} antialiased`}
        style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
      >
        {children}
      </body>
    </html>
  )
}
