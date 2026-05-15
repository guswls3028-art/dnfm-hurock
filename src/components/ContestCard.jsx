import Link from "next/link";
import StickerBadge from "@/components/StickerBadge";

/**
 * ContestCard — 콘테스트 목록 카드.
 *  - status: draft | open | judging | voting | completed
 *  - tone: pink | cyan | amber | lime — 카드 상단 띠 색
 */
const toneToCardClass = {
  pink: "card-tone-pink",
  cyan: "card-tone-cyan",
  amber: "card-tone-amber",
  lime: "card-tone-lime"
};

const statusToSticker = {
  draft: { tone: "ink", label: "임시저장" },
  open: { tone: "pink", label: "참가중" },
  judging: { tone: "amber", label: "심사중" },
  voting: { tone: "cyan", label: "투표중" },
  completed: { tone: "amber", label: "결과" },
};

export default function ContestCard({ contest, tilt }) {
  const toneClass = toneToCardClass[contest.tone] || "";
  const sticker = statusToSticker[contest.status] || {
    tone: "ink",
    label: contest.statusLabel || "상태 확인",
  };

  const detailHref =
    contest.status === "completed"
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
        {contest.submissionCloses && <span>마감: {contest.submissionCloses}</span>}
        {contest.voteWindow && <span>· 투표: {contest.voteWindow}</span>}
        {typeof contest.entries === "number" && <span>· 참가 {contest.entries}명</span>}
      </div>
      <div className="card-actions">
        <Link className="btn btn-sm btn-primary" href={detailHref}>
          {contest.status === "open"
            ? "참가하기"
            : contest.status === "voting"
            ? "투표하기"
            : contest.status === "completed"
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
