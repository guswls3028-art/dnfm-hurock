import StickerBadge from "@/components/StickerBadge";

/**
 * VoteCard — 투표 entry 카드 (선택 라디오).
 *  - 1인 1표 mock (라디오 그룹)
 *  - submit 은 backend 미연동 — disabled
 */
export default function VoteCard({ entry, groupName, selected, onSelect, disabled }) {
  const id = `vote-${entry.id}`;
  return (
    <label htmlFor={id} className="entry-card" style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1 }}>
      <div className="entry-photo">
        {entry.tone && (
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
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
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
        </div>
      </div>
    </label>
  );
}
