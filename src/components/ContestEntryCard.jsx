import StickerBadge from "@/components/StickerBadge";
import { formatAuthor, isAnonymousEntry } from "@/lib/anonymous";
import { entryPhotoValue, uploadPublicUrl } from "@/lib/upload-url";

/**
 * ContestEntryCard — 참가 entry 카드.
 *  - 업로드된 R2 사진을 표시하고, 없을 때만 placeholder 노출
 *  - tone: sticker 색
 *  - showRank: 결과 발표 페이지에서 등수 sticker 표시
 *  - 작성자 표시: 회원=displayName / 비회원=닉(IP끝자리) — 디시 스타일
 */
export default function ContestEntryCard({ entry, rank, memberDisplayName }) {
  const author = formatAuthor(entry, memberDisplayName);
  const guest = isAnonymousEntry(entry);
  const fields = entry.fields || entry;
  const title = entry.title || fields.title || "제목 없음";
  const description = entry.description || fields.description || "";
  const photoUrl = uploadPublicUrl(entryPhotoValue(entry));
  return (
    <article className="entry-card">
      <div className={`entry-photo${photoUrl ? " has-image" : ""}`}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${fields.characterName || title} 참가 사진`}
            loading="lazy"
          />
        ) : null}
        {rank && (
          <StickerBadge tone={rank === 1 ? "pink" : rank === 2 ? "cyan" : "amber"} rotate="l">
            {rank}등
          </StickerBadge>
        )}
        {!rank && entry.tone && (
          <StickerBadge tone={entry.tone} rotate="r">
            {title.slice(0, 4)}
          </StickerBadge>
        )}
      </div>
      <div className="entry-meta">
        <strong>{title}</strong>
        <span>
          {fields.adventureName || "-"} · {fields.characterName || "-"}
        </span>
        <span className={`entry-author${guest ? " entry-author--guest" : ""}`}>
          작성자: <strong>{author}</strong>
        </span>
        <p>{description}</p>
      </div>
    </article>
  );
}
