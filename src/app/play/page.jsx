import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";

/**
 * /play — 방송 중 쓰는 게임 포탈.
 * 매번 새 창 띄우기 번거로움 해소 — 한 페이지에서 게임 2개 바로가기 + 운영 ID 메모.
 * 별 다른 통합 없이 새 탭으로 띄움 (각 게임 사이트가 iframe X-Frame-Options 막을 가능성).
 */
const GAMES = [
  {
    id: "kr-roulette",
    label: "한글 도메인 룰렛",
    url: "https://xn--ok0bj0i6sfoyp9no.com/",
    note: "쓸 ID/PS 로 로그인 후 운영",
    emoji: "🎰",
    tone: "pink",
  },
  {
    id: "lazygyu-roulette",
    label: "lazygyu 핀볼 룰렛",
    url: "https://lazygyu.github.io/roulette/",
    note: "참가자 이름 붙여넣기 → 핀볼 떨굼",
    emoji: "🎯",
    tone: "cyan",
  },
];

const ADMIN_ACCOUNT = {
  id: "hurock1234",
  // 비번은 본인 메모용 — 운영 의미 (관리자 본인만 보는 페이지로 가정. 실제 공개는 안 추천)
  note: "관리자 계정 — 본인만 사용",
};

export default function PlayPortalPage() {
  return (
    <PageShell activePath="/play">
      <div className="page-head">
        <div>
          <h1>방송 게임 포탈 <StickerBadge tone="cyan" rotate="r">바로가기</StickerBadge></h1>
          <p>매번 새 창 띄우기 번거로워서 한 페이지에 모았어요. 클릭하면 새 탭으로 열림.</p>
        </div>
      </div>

      <section className="section" aria-labelledby="play-games">
        <div className="section-head">
          <h2 id="play-games">게임 사이트</h2>
        </div>
        <div className="grid grid-2">
          {GAMES.map((g, i) => (
            <a
              key={g.id}
              className={`card card-tone-${g.tone}`}
              href={g.url}
              target="_blank"
              rel="noreferrer"
              data-tilt={i % 2 === 0 ? "l" : "r"}
              style={{ textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2.2rem", lineHeight: 1 }} aria-hidden="true">
                  {g.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0 }}>{g.label}</h3>
                  <small style={{ color: "var(--ink-soft)", fontWeight: 800 }}>{g.note}</small>
                </div>
                <StickerBadge tone="amber" rotate="r">새 탭 ↗</StickerBadge>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: "0.84rem", color: "var(--muted)", wordBreak: "break-all" }}>
                {g.url}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="play-account">
        <div className="section-head">
          <h2 id="play-account">관리자 ID <StickerBadge tone="pink" rotate="r">본인 메모</StickerBadge></h2>
        </div>
        <article className="card card-tone-amber">
          <dl className="kvs">
            <dt>ID</dt>
            <dd><code>{ADMIN_ACCOUNT.id}</code></dd>
            <dt>비번</dt>
            <dd style={{ color: "var(--muted)" }}>본인 메모장 참조 (페이지 공개 X)</dd>
          </dl>
          <small style={{ color: "var(--ink-soft)" }}>{ADMIN_ACCOUNT.note}</small>
        </article>
      </section>
    </PageShell>
  );
}
