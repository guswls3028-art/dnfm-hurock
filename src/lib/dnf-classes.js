/**
 * 던파 모바일 baseClass 목록 — frontend datalist / grouped select 용 (read-only copy).
 *
 * SSOT: `api/src/domains/auth/dnf-classes.ts` (backend normalizeClassName).
 * 사용자가 OCR 보정·직접 추가 시 직업 입력을 보조하기 위한 자동완성/선택 목록.
 *
 * "메카닉" 처럼 baseClass 가 동일하지만 성별별로 다른 직업의 경우
 * classGroup 이 다른 두 entry 로 분리되어 표시된다.
 * (저장 시 backend 가 group + baseClass 로 정규화)
 *
 * iconPath: 사용자(방장) 본인 모험단 직업 변경 캡처에서 crop 한 원형 아이콘.
 * 자산은 newb/public/class/, hurock/public/class/ 에 동일 자산 복사.
 */

export const DNF_CLASS_GROUPS_ORDER = [
  "귀검사(남)", "귀검사(여)",
  "격투가(남)", "격투가(여)",
  "거너(남)", "거너(여)",
  "마법사(남)", "마법사(여)",
  "프리스트(남)", "프리스트(여)",
  "도적", "워리어", "마창사",
];

function iconFile(group, baseClass) {
  const g = group.replace(/[()]/g, (m) => (m === "(" ? "-" : ""));
  const k = baseClass.replace(/\s+/g, "");
  return `/class/${g}_${k}.png`;
}

function cls(group, baseClass) {
  return { baseClass, iconPath: iconFile(group, baseClass) };
}

/**
 * Grouped class list — UI select 의 <optgroup> 용.
 * 던파 모바일 미출시 직업(다크나이트 / 크리에이터)은 제외.
 *
 * 각 entry: { baseClass, iconPath } — UI 에서 select option 옆 아이콘 미리보기 가능.
 */
export const DNF_CLASSES_GROUPED = [
  { group: "귀검사(남)", classes: [
    cls("귀검사(남)", "웨펀마스터"),
    cls("귀검사(남)", "소울브링어"),
    cls("귀검사(남)", "버서커"),
    cls("귀검사(남)", "아수라"),
  ]},
  { group: "귀검사(여)", classes: [
    cls("귀검사(여)", "소드마스터"),
    cls("귀검사(여)", "다크템플러"),
    cls("귀검사(여)", "데몬슬레이어"),
    cls("귀검사(여)", "베가본드"),
    cls("귀검사(여)", "블레이드"),
  ]},
  { group: "격투가(남)", classes: [
    cls("격투가(남)", "스트라이커"),
    cls("격투가(남)", "스트리트파이터"),
  ]},
  { group: "격투가(여)", classes: [
    cls("격투가(여)", "넨마스터"),
    cls("격투가(여)", "스트라이커"),
    cls("격투가(여)", "스트리트파이터"),
    cls("격투가(여)", "그래플러"),
  ]},
  { group: "거너(남)", classes: [
    cls("거너(남)", "레인저"),
    cls("거너(남)", "런처"),
    cls("거너(남)", "메카닉"),
    cls("거너(남)", "스핏파이어"),
  ]},
  { group: "거너(여)", classes: [
    cls("거너(여)", "레인저"),
    cls("거너(여)", "런처"),
    cls("거너(여)", "메카닉"),
    cls("거너(여)", "스핏파이어"),
  ]},
  { group: "마법사(남)", classes: [
    cls("마법사(남)", "빙결사"),
    cls("마법사(남)", "스위프트마스터"),
  ]},
  { group: "마법사(여)", classes: [
    cls("마법사(여)", "엘레멘탈마스터"),
    cls("마법사(여)", "배틀메이지"),
    cls("마법사(여)", "마도학자"),
    cls("마법사(여)", "인챈트리스"),
  ]},
  { group: "프리스트(남)", classes: [
    cls("프리스트(남)", "크루세이더"),
    cls("프리스트(남)", "인파이터"),
  ]},
  { group: "프리스트(여)", classes: [
    cls("프리스트(여)", "크루세이더"),
    cls("프리스트(여)", "이단심판관"),
    cls("프리스트(여)", "무녀"),
    cls("프리스트(여)", "미스트리스"),
    cls("프리스트(여)", "인파이터"),
  ]},
  { group: "도적", classes: [
    cls("도적", "로그"),
    cls("도적", "쿠노이치"),
  ]},
  { group: "워리어", classes: [
    cls("워리어", "와일드베인"),
    cls("워리어", "윈드시어"),
  ]},
  { group: "마창사", classes: [
    cls("마창사", "뱅가드"),
    cls("마창사", "다크 랜서"),
  ]},
];

/** 선택된 (group, baseClass) → iconPath 조회. 못 찾으면 null. */
export function findClassIcon(group, baseClass) {
  if (!group || !baseClass) return null;
  const g = DNF_CLASSES_GROUPED.find((x) => x.group === group);
  if (!g) return null;
  const c = g.classes.find((x) => x.baseClass === baseClass);
  return c?.iconPath || null;
}

/** baseClass 만 알 때 — 첫 매치 entry 의 iconPath (group 가변일 때 fallback). */
export function findFirstClassIcon(baseClass) {
  if (!baseClass) return null;
  for (const g of DNF_CLASSES_GROUPED) {
    const c = g.classes.find((x) => x.baseClass === baseClass);
    if (c) return c.iconPath;
  }
  return null;
}

/**
 * 호환용 — DnfProfileForm 등 기존 컴포넌트가 사용.
 * Grouped 데이터에서 baseClass 만 평탄화 + 중복 제거.
 */
export const DNF_BASE_CLASSES_UNIQUE = Array.from(
  new Set(DNF_CLASSES_GROUPED.flatMap((g) => g.classes.map((c) => c.baseClass)))
);
