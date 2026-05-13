import Link from "next/link";
import StickerBadge from "@/components/StickerBadge";

/**
 * ContestCard — 콘테스트 목록 카드.
 *  - status: submission | voting | ended | announced
 *  - tone: pink | cyan | amber | lime — 카드 상단 띠 색
 */
const toneToCardClass = {
  pink: "card-tone-pink",
  cyan: "card-tone-cyan",
  amber: "card-tone-amber",
  lime: "card-tone-lime"
};

const statusToSticker = {
  submission: { tone: "pink", label: "참가중" },
  voting: { tone: "cyan", label: "투표중" },
  ended: { tone: "ink", label: "종료" },
  announced: { tone: "amber", label: "결과" }
};

export default function ContestCard({ contest, tilt }) {
  const toneClass = toneToCardClass[contest.tone] || "";
  const sticker = statusToSticker[contest.status] || statusToSticker.submission;

  const detailHref =
    contest.status === "announced"
      ? `/contests/${contest.id}/results`
      : contest.status === "voting"
      ? `/contests/${contest.id}/vote`
      : `/contests/${contest.id}`;

  return (
    <article className={`card ${toneClass}`} data-tilt={tilt}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ fontSize: "2rem", lineHeight: 1 }} aria-hidden="true">
          {contest.posterEmoji}
        </div>
        <StickerBadge tone={sticker.tone} rotate="r">
          {sticker.label}
        </StickerBadge>
      </div>
      <h3>{contest.title}</h3>
      <p>{contest.subtitle}</p>
      <div className="card-meta">
        <span>마감: {contest.submissionCloses}</span>
        <span>· 투표: {contest.voteWindow}</span>
        <span>· 참가 {contest.entries}명</span>
      </div>
      <div className="card-actions">
        <Link className="btn btn-sm btn-primary" href={detailHref}>
          {contest.status === "submission"
            ? "참가하기"
            : contest.status === "voting"
            ? "투표하기"
            : contest.status === "announced"
            ? "결과 보기"
            : "자세히"}
        </Link>
        <Link className="btn btn-sm" href={`/contests/${contest.id}`}>
          상세
        </Link>
      </div>
    </article>
  );
}
