/**
 * 던파 모바일 baseClass 목록 — frontend datalist 용 (read-only copy).
 *
 * SSOT: `api/src/domains/auth/dnf-classes.ts` (backend normalizeClassName).
 * 사용자가 OCR 보정·직접 추가 시 직업 입력을 보조하기 위한 autocomplete 목록.
 * 각성명·alias 는 backend 가 정규화하므로 frontend 는 baseClass 만 노출.
 */

export const DNF_BASE_CLASSES = [
  // 귀검사(남)
  "웨펀마스터", "소울브링어", "버서커", "아수라",
  // 귀검사(여)
  "소드마스터", "데몬슬레이어", "베가본드", "다크템플러", "블레이드",
  // 격투가(여)
  "넨마스터", "스트라이커", "스트리트파이터", "그래플러",
  // 격투가(남) — 동일 baseClass 가 있지만 frontend datalist 는 중복 제거
  // 거너(남)
  "레인저", "런처", "메카닉", "스핏파이어",
  // 마법사(여)
  "엘레멘탈마스터", "마도학자", "배틀메이지", "인챈트리스",
  // 마법사(남)
  "빙결사", "스위프트마스터",
  // 프리스트(남)
  "크루세이더", "인파이터", "퇴마사", "어벤저",
  // 프리스트(여)
  "이단심판관", "미스트리스",
  // 도적
  "사령술사", "쿠노이치", "로그", "섀도우댄서",
  // 워리어
  "엘븐나이트", "카오스",
  // 마창사 / 다크나이트 / 크리에이터
  "다크 랜서", "드래곤나이트", "듀얼리스트", "뱅가드",
];

// 중복 제거 (격투가 남/여 stryker 등)
export const DNF_BASE_CLASSES_UNIQUE = Array.from(new Set(DNF_BASE_CLASSES));
