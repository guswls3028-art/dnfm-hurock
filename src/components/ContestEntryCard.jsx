import StickerBadge from "@/components/StickerBadge";
import { formatAuthor, isAnonymousEntry } from "@/lib/anonymous";

/**
 * ContestEntryCard — 참가 entry 카드.
 *  - 이미지 자리 placeholder (사선 패턴)
 *  - tone: sticker 색
 *  - showRank: 결과 발표 페이지에서 등수 sticker 표시
 *  - 작성자 표시: 회원=displayName / 비회원=닉(IP끝자리) — 디시 스타일
 */
export default function ContestEntryCard({ entry, rank, memberDisplayName }) {
  const author = formatAuthor(entry, memberDisplayName);
  const guest = isAnonymousEntry(entry);
  // form_schema 결과는 entry.fields 안. mock 데이터는 root 에 직접.
  const fields = entry.fields || entry;
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
            {(entry.title || fields.title || "").slice(0, 4)}
          </StickerBadge>
        )}
      </div>
      <div className="entry-meta">
        <strong>{entry.title || fields.title}</strong>
        <span>
          {fields.adventureName} · {fields.characterName}
        </span>
        <span className={`entry-author${guest ? " entry-author--guest" : ""}`}>
          작성자: <strong>{author}</strong>
        </span>
        <p>{entry.description || fields.description}</p>
      </div>
    </article>
  );
}
