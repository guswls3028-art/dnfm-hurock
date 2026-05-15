/**
 * 던파 모바일 baseClass 목록 — frontend datalist / grouped select 용 (read-only copy).
 *
 * SSOT: `api/src/domains/auth/dnf-classes.ts` (backend normalizeClassName).
 * 사용자가 OCR 보정·직접 추가 시 직업 입력을 보조하기 위한 자동완성/선택 목록.
 *
 * "메카닉" 처럼 baseClass 가 동일하지만 성별별로 다른 직업의 경우
 * classGroup 이 다른 두 entry 로 분리되어 표시된다.
 * (저장 시 backend 가 group + baseClass 로 정규화)
 */

export const DNF_CLASS_GROUPS_ORDER = [
  "귀검사(남)", "귀검사(여)",
  "격투가(남)", "격투가(여)",
  "거너(남)", "거너(여)",
  "마법사(남)", "마법사(여)",
  "프리스트(남)", "프리스트(여)",
  "도적", "워리어", "마창사",
];

/**
 * Grouped class list — UI select 의 <optgroup> 용.
 * 던파 모바일 미출시 직업(다크나이트 / 크리에이터)은 제외.
 */
export const DNF_CLASSES_GROUPED = [
  { group: "귀검사(남)", classes: ["웨펀마스터", "소울브링어", "버서커", "아수라"] },
  { group: "귀검사(여)", classes: ["소드마스터", "데몬슬레이어", "베가본드", "다크템플러", "블레이드"] },
  { group: "격투가(남)", classes: ["스트라이커", "스트리트파이터"] },
  { group: "격투가(여)", classes: ["넨마스터", "스트라이커", "스트리트파이터", "그래플러"] },
  { group: "거너(남)", classes: ["레인저", "런처", "메카닉", "스핏파이어"] },
  { group: "거너(여)", classes: ["레인저", "런처", "메카닉", "스핏파이어"] },
  { group: "마법사(남)", classes: ["빙결사", "스위프트마스터"] },
  { group: "마법사(여)", classes: ["엘레멘탈마스터", "마도학자", "배틀메이지", "인챈트리스"] },
  { group: "프리스트(남)", classes: ["크루세이더", "인파이터"] },
  { group: "프리스트(여)", classes: ["크루세이더", "이단심판관", "무녀", "미스트리스", "인파이터"] },
  { group: "도적", classes: ["로그", "쿠노이치"] },
  { group: "워리어", classes: ["와일드베인", "윈드시어"] },
  { group: "마창사", classes: ["뱅가드", "다크 랜서"] },
];

function iconFile(group, baseClass) {
  const g = group.replace(/[()]/g, (m) => (m === "(" ? "-" : ""));
  const k = baseClass.replace(/\s+/g, "");
  return `/class/${g}_${k}.png`;
}

/** baseClass 만 알 때 — 첫 매치 entry 의 iconPath (group 가변일 때 fallback). */
export function findFirstClassIcon(baseClass) {
  if (!baseClass) return null;
  for (const g of DNF_CLASSES_GROUPED) {
    if (g.classes.includes(baseClass)) return iconFile(g.group, baseClass);
  }
  return null;
}

/**
 * select option value — "group::baseClass" 의 정규화 키.
 * 저장 시 backend 로 보내는 klass 문자열은 baseClass 만 (group 은 컨텍스트).
 * UI 표시는 "거너(여) 메카닉" 처럼 group prefix 로 disambiguate.
 */
export function formatClassLabel(group, baseClass) {
  return `${group} ${baseClass}`;
}

/**
 * 호환용 — DnfProfileForm 등 기존 컴포넌트가 사용.
 * Grouped 데이터에서 평탄화 + 중복 제거.
 */
export const DNF_BASE_CLASSES_UNIQUE = Array.from(
  new Set(DNF_CLASSES_GROUPED.flatMap((g) => g.classes))
);
