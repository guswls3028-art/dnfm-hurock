/**
 * 비회원 작성자 표시 fmt — 디시 스타일.
 *
 * 정책 SSOT: project_anonymous_posting_policy.md (2026-05-14).
 *
 *   회원       → `{displayName}`   (예: "라피헌터")
 *   비회원 + 닉 → `{nickname}({marker})` (예: "지나가던행인(192.168)")
 *   비회원 닉X  → `ㅇㅇ({marker})`        (예: "ㅇㅇ(192.168)")
 *   marker 도 없으면 (이전 데이터) → "ㅇㅇ"
 *
 * Backend shape (entries / posts / comments):
 *   - authorId   : string|null  → null 이면 비회원
 *   - authorNickname : string|null
 *   - anonymousMarker : string|null   (e.g., "192.168")
 *   - (회원) author?.displayName 또는 별도 join 결과
 */

/**
 * @param {{ authorId?: string|null, authorNickname?: string|null, anonymousMarker?: string|null }} entry
 * @param {string|null|undefined} memberDisplayName  회원 displayName (join 으로 받는 경우)
 * @returns {string}
 */
export function formatAuthor(entry, memberDisplayName) {
  if (!entry) return "ㅇㅇ";
  // 회원 글
  if (entry.authorId) {
    return memberDisplayName || "회원";
  }
  // 비회원
  const nick = entry.authorNickname?.trim() || "ㅇㅇ";
  const marker = entry.anonymousMarker?.trim();
  return marker ? `${nick}(${marker})` : nick;
}

/**
 * 비회원 여부 — 응답 entry 의 authorId 가 null/undefined 이면 비회원.
 */
export function isAnonymousEntry(entry) {
  return !entry?.authorId;
}
