import "./globals.css";

export const metadata = {
  title: {
    default: "허락 | allow.dnfm.kr",
    template: "%s | dnfm.kr"
  },
  description: "허락님 방송 공지, 링크, 커뮤니티 동선을 정리하는 스트리머 페이지",
  metadataBase: new URL("https://allow.dnfm.kr")
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
