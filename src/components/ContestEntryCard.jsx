import StickerBadge from "@/components/StickerBadge";

/**
 * ContestEntryCard — 참가 entry 카드.
 *  - 이미지 자리 placeholder (사선 패턴)
 *  - tone: sticker 색
 *  - showRank: 결과 발표 페이지에서 등수 sticker 표시
 */
export default function ContestEntryCard({ entry, rank }) {
  return (
    <article className="entry-card">
      <div className="entry-photo">
        {rank && (
          <StickerBadge tone={rank === 1 ? "pink" : rank === 2 ? "cyan" : "amber"} rotate="l">
            {rank}등
          </StickerBadge>
        )}
        {!rank && entry.tone && (
          <StickerBadge tone={entry.tone} rotate="r">
            {entry.title.slice(0, 4)}
          </StickerBadge>
        )}
      </div>
      <div className="entry-meta">
        <strong>{entry.title}</strong>
        <span>
          {entry.adventureName} · {entry.characterName}
        </span>
        <p>{entry.description}</p>
      </div>
    </article>
  );
}
