"use client";

import StickerBadge from "./StickerBadge";
import { findClassIcon, findUniqueClassIcon, formatClassText } from "@/lib/dnf-classes";

function avatarPublicUrl(r2Key) {
  if (!r2Key) return null;
  if (/^https?:\/\//i.test(r2Key)) return r2Key;
  return `https://api.dnfm.kr/uploads/r2/${encodeURIComponent(r2Key)}`;
}

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
  const mainClassGroup = dnf.mainCharacterClassGroup;
  const adv = dnf.adventurerName;
  const avatarUrl = avatarPublicUrl(author.avatarR2Key);
  const mainIcon = findClassIcon(mainClassGroup, klass) || findUniqueClassIcon(klass);
  const characters = Array.isArray(dnf.characters) ? dnf.characters : [];
  const subCharacters = characters.filter((c) => c?.name && c.name !== main);

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
        <span
          aria-hidden="true"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            background: "rgba(0,0,0,0.08)",
            border: "1px solid var(--ink-line, rgba(0,0,0,0.14))",
            fontWeight: 900,
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            displayName?.[0] || "?"
          )}
        </span>
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
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "rgba(0,0,0,0.08)",
                  border: "1px solid var(--ink-line, rgba(0,0,0,0.14))",
                  flex: "0 0 auto",
                }}
              >
                {mainIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainIcon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </span>
              <span style={{ display: "grid", gap: 2 }}>
                <span style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.78rem" }}>
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
                      · {formatClassText(mainClassGroup, klass)}
                    </em>
                  ) : null}
                </span>
              </span>
            </div>
          ) : null}
          {adv ? (
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ minWidth: 84, color: "var(--muted)", fontWeight: 700 }}>모험단</span>
              <span>{adv}</span>
            </div>
          ) : null}
          {subCharacters.length > 0 ? (
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontWeight: 700 }}>부캐</span>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {subCharacters.slice(0, 12).map((c, i) => {
                  const icon = findClassIcon(c.classGroup, c.klass) || findUniqueClassIcon(c.klass);
                  return (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 7px 4px 4px",
                        background: "rgba(0,0,0,0.06)",
                        border: "1px solid var(--ink-line, rgba(0,0,0,0.12))",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                      }}
                    >
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={icon}
                          alt=""
                          aria-hidden="true"
                          style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : null}
                      {c.name}
                      {c.klass ? (
                        <em style={{ fontStyle: "normal", color: "var(--muted)" }}>
                          · {formatClassText(c.classGroup, c.klass)}
                        </em>
                      ) : null}
                    </span>
                  );
                })}
                {subCharacters.length > 12 ? (
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                    +{subCharacters.length - 12}
                  </span>
                ) : null}
              </span>
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
