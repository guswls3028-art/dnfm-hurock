import StickerBadge from "@/components/StickerBadge";
import { entryPhotoValue, uploadPublicUrl } from "@/lib/upload-url";

/**
 * VoteCard — backend 콘테스트 투표 entry 카드.
 */
export default function VoteCard({ entry, groupName, selected, onSelect, disabled, votes = 0 }) {
  const id = `vote-${entry.id}`;
  const fields = entry.fields || entry;
  const title = entry.title || fields.title || "제목 없음";
  const description = entry.description || fields.description || "";
  const photoUrl = uploadPublicUrl(entryPhotoValue(entry));
  return (
    <label htmlFor={id} className="entry-card" style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1 }}>
      <div className={`entry-photo${photoUrl ? " has-image" : ""}`}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${fields.characterName || title} 참가 사진`}
            loading="lazy"
          />
        ) : null}
        {entry.tone && (
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
        <p>{description}</p>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <input
            id={id}
            type="radio"
            name={groupName}
            value={entry.id}
            checked={!!selected}
            onChange={() => onSelect?.(entry.id)}
            disabled={disabled}
            style={{ width: 18, height: 18 }}
          />
          <span style={{ fontWeight: 800, fontSize: "0.86rem" }}>이 코디에 투표</span>
          <StickerBadge tone="cyan" rotate="0">
            {votes}표
          </StickerBadge>
        </div>
      </div>
    </label>
  );
}
