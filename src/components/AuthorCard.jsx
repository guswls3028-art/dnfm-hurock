"use client";

import StickerBadge from "./StickerBadge";

/**
 * 게시글 본문 끝에 들어가는 작성자 카드. hurock B급 톤.
 *
 *   - 노트북 종이 + 점선 + 스티커 강조.
 *   - 4 필드: 사이트 닉네임 / 모험단 / 대표 캐릭 / 직업.
 *   - 항마력 / 길드 / 서버 / 레벨 표시 X (사용자 정책).
 *   - 인증 마크는 verifiedBySelectScreen=true 만 ✓ 스티커.
 */
export default function AuthorCard({ author }) {
  if (!author) return null;
  const displayName = author.displayName || "(닉네임 없음)";
  const dnf = author.dnfProfile || {};
  const verified = !!dnf.verifiedBySelectScreen;
  const main = dnf.mainCharacterName;
  const klass = dnf.mainCharacterClass;
  const adv = dnf.adventurerName;

  return (
    <aside
      className="author-card-hurock"
      aria-label={`작성자 ${displayName} 정보`}
      style={{
        marginTop: 18,
        padding: "14px 16px",
        border: "2px dashed var(--ink, #1a1a1a)",
        background: "var(--paper, #fffef7)",
        borderRadius: 6,
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: "1px dashed var(--ink, #1a1a1a)",
        }}
      >
        <StickerBadge tone="pink" rotate="l">
          {displayName}
        </StickerBadge>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.92rem" }}>
          님의
        </span>
        {verified ? (
          <StickerBadge tone="yellow" rotate="r">
            ✓ 인증
          </StickerBadge>
        ) : null}
      </header>

      {main || adv ? (
        <div style={{ display: "grid", gap: 8, fontSize: "0.9rem" }}>
          {main ? (
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ minWidth: 84, color: "var(--muted)", fontWeight: 700 }}>
                대표 캐릭터
              </span>
              <span>
                <strong>{main}</strong>
                {klass ? (
                  <em
                    style={{
                      fontStyle: "normal",
                      color: "var(--muted)",
                      marginLeft: 6,
                    }}
                  >
                    · {klass}
                  </em>
                ) : null}
              </span>
            </div>
          ) : null}
          {adv ? (
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ minWidth: 84, color: "var(--muted)", fontWeight: 700 }}>모험단</span>
              <span>{adv}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
          모험단 인증 정보 없음
        </div>
      )}
    </aside>
  );
}
