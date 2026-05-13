import "./globals.css";

export const metadata = {
  title: {
    default: "허락 | allow.dnfm.kr",
    template: "%s | 허락"
  },
  description:
    "허락 (allow.dnfm.kr) — 인터넷 방송인 허락의 던파 모바일 방송 페이지. 시청자 콘테스트, 허락방 게시판, 결과 발표.",
  metadataBase: new URL("https://allow.dnfm.kr"),
  openGraph: {
    title: "허락 | allow.dnfm.kr",
    description: "허락 방송 + 시청자 콘테스트 페이지",
    locale: "ko_KR",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
