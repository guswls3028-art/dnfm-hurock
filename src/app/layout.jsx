import "./globals.css";

export const metadata = {
  title: {
    default: "허락공대 | hurock.dnfm.kr",
    template: "%s | 허락공대"
  },
  description:
    "허락공대 (hurock.dnfm.kr / 옛 allow.dnfm.kr) — 인터넷 방송인 허락의 던파 모바일 방송 페이지. 시청자 콘테스트 / 룰렛 / 게시판.",
  metadataBase: new URL("https://hurock.dnfm.kr"),
  openGraph: {
    title: "허락공대 — 던파 모바일 방송 + 시청자 콘테스트",
    description: "평일 19시 이후 / 주말 일찍 ON. 즐겁게 게임하자.",
    url: "https://hurock.dnfm.kr",
    siteName: "허락공대",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/hurock-avatar.png",
        width: 500,
        height: 500,
        alt: "허락공대 — 오니 마스크 캐릭터"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "허락공대 — 던파 모바일 방송",
    description: "시청자 콘테스트 + 룰렛 + 게시판",
    images: ["/hurock-avatar.png"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
