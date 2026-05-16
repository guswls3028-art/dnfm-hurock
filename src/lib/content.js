/**
 * hurock.dnfm.kr — 정적 콘텐츠 SSOT
 *
 * 방송 링크, 배너, 메뉴처럼 사이트 구조를 이루는 설정만 둔다.
 * 게시글/공지/콘테스트 참가작은 api.dnfm.kr 실 데이터를 사용한다.
 */

export const siteMeta = {
  id: "hurock",
  hostnames: ["hurock.dnfm.kr", "allow.dnfm.kr"],
  brand: "허락공대",
  brandShort: "허락공대",
  wordmark: "허락공대",
  tagline: "던파 모바일 인터넷 방송",
  footerNote:
    "허락공대 (hurock.dnfm.kr, legacy allow.dnfm.kr) 은 인터넷 방송인 허락의 비공식 팬 페이지 겸 방송 동선 정리 페이지입니다. 게임 관련 상표권은 각 권리자에게 있으며, 본 페이지는 어떠한 공식 인증도 받지 않았습니다."
};

// 헤더 상단 nav 제거 — 빈 배열 (호환). 진입은 첫 화면 게시판 카테고리/콘테스트 카드로.
export const navItems = [];

export const siblingSite = {
  label: "뉴비 훈련소",
  href: "https://dnfm.kr",
  note: "던파 모바일 입문 가이드 (연결 플랫폼)"
};

// 최상단 슬라이딩 배너 — 5초 자동 회전. 던파 공홈 메인 슬라이더 레이어.
// 허락 본인 portrait 는 슬라이더에서 분리 → HostBanner 컴포넌트로 이동.
//
// 콘테스트 진입은 콘테스트 목록(`/contests`) 으로 일원화.
// heroBanners 가 특정 id 를 hard-link 하면 backend 미등록 시 404 위험.
export const heroBanners = [
  {
    id: "avatar-look-contest",
    kind: "wide-text",
    title: "아바타 룩 콘테스트",
    subtitle: "5개 부문 코디 자랑 — 6월 13일(토) 마감",
    emoji: "👗",
    accentTone: "pink",
    href: "/contests",
    alt: "아바타 룩 콘테스트 배너",
    cta: "참가 / 자세히 보기",
  },
  {
    id: "newbie",
    kind: "wide",
    title: "뉴비 훈련소",
    subtitle: "던파 모바일 입문 가이드 — dnfm.kr",
    src: "/openchat-newbie-banner.png",
    alt: "뉴비 훈련소 배너",
    href: "https://dnfm.kr",
  },
  {
    id: "asicoroco",
    kind: "wide",
    title: "아스시로코 클럽",
    subtitle: "허락 운영 오픈채팅",
    src: "/openchat-jaehae-banner.png",
    alt: "아스시로코 클럽 배너",
    href: "https://open.kakao.com/o/gITUzMWg",
  },
];

// 가운데 커뮤니티+ 게시판 탭 — 톡방 합의: 공지사항 / 이벤트 / 대회 / 자유
export const communityTabs = [
  { key: "notice", label: "공지사항", tone: "cyan",  href: "/board?category=broadcast" },
  { key: "event",  label: "이벤트",  tone: "pink",  href: "/contests" },
  { key: "match",  label: "대회",    tone: "amber", href: "/board?category=contest_qa" },
  { key: "free",   label: "자유",    tone: "lime",  href: "/board?category=talk" },
];

// 이벤트 슬라이딩 카드 — 큰 비주얼 카드 (열혈패스 류)
// 진입은 콘테스트 목록(`/contests`) 으로 일원화.
export const eventBanners = [
  {
    id: "evt-avatar-1",
    title: "아바타 콘테스트 1회",
    subtitle: "5개 부문 코디 자랑 — 사용자 투표 + 허락 심사",
    accentTone: "pink",
    emoji: "👗",
    href: "/contests",
  },
];

// 햄버거 사이드 메뉴 — 던파 공홈 다단 구조 차용
export const sideMenu = [
  {
    section: "새소식",
    items: [
      { label: "공지사항", href: "/board?category=broadcast" },
      { label: "업데이트", href: "/board?category=broadcast&kind=update" },
      { label: "이벤트", href: "/contests" },
    ],
  },
  {
    section: "방송",
    items: [
      { label: "SOOP 라이브", href: "https://ch.sooplive.co.kr/hurock0101", external: true },
      { label: "치지직", href: "https://chzzk.naver.com/290f875e595cef717d10deeab70a8b71", external: true },
      { label: "유튜브", href: "https://youtube.com/@허락공대", external: true },
      { label: "방송 Q&A", href: "/questions" },
      { label: "추첨 기록", href: "/play" },
    ],
  },
  {
    section: "커뮤니티",
    items: [
      { label: "자유 게시판", href: "/board?category=talk" },
      { label: "공지사항", href: "/board?category=broadcast" },
      { label: "이벤트", href: "/contests" },
      { label: "대회", href: "/board?category=contest_qa" },
    ],
  },
  {
    section: "내 정보",
    items: [
      { label: "내 페이지", href: "/profile" },
      { label: "내 이벤트 상태", href: "/me/events" },
      { label: "로그인 / 가입", href: "/login" },
    ],
  },
  {
    section: "친구들",
    items: [
      { label: "뉴비 훈련소 (dnfm.kr) ↗", href: "https://dnfm.kr", external: true },
    ],
  },
];

// 기존 5종 진입 카드 — 호환 유지 (이미 다른 페이지에서 import 가능). 신규 홈은 communityTabs 사용.
export const boardEntryCategories = [
  { key: "event",  label: "이벤트",  emoji: "🎉", tone: "pink",  note: "콘테스트 / 추첨 / 미션", href: "/contests" },
  { key: "match",  label: "대회",   emoji: "🏆", tone: "amber", note: "콘테스트 질문 / 일정",  href: "/board?category=contest_qa" },
  { key: "chat",   label: "잡담",   emoji: "💬", tone: "cyan",  note: "자유 수다",            href: "/board?category=talk" },
  { key: "clip",   label: "방송",   emoji: "🎬", tone: "lime",  note: "방송 공지 / 일정",      href: "/board?category=broadcast" },
  { key: "report", label: "신고건의", emoji: "🛠️", tone: "ink", note: "버그 / 운영 건의",     href: "/board?category=report" },
];

export const loginProviders = [
  { id: "self", label: "허락 계정으로 로그인", note: "아이디·비밀번호" },
  { id: "google", label: "Google 로그인", note: "소셜 계정으로 계속하기" },
  { id: "kakao", label: "카카오 로그인", note: "소셜 계정으로 계속하기" }
];

/**
 * 허락님 — 던파 모바일 스트리머 (채널: 허락공대, @허락공대).
 * 가입 2025-04-07 / 구독자 497 / 동영상 258 / 조회수 164,444.
 */
export const host = {
  name: "허락",
  channelName: "허락공대",
  channelHandle: "@허락공대",
  tagline: "[던파모바일] 뉴비·부캐 지원 + 컨설팅 + 미션",
  avatarSrc: "/hurock-avatar.png",
  avatarAlt: "허락 프로필 — 오니 마스크 캐릭터",
  contents: [
    "레이드/각종 던전 뉴비 및 부캐 지원",
    "뉴비 육성 방향 / 효율성 컨설팅",
    "강화 / 상자깡 / 합성 등 다양한 콘텐츠",
    "재밌는 미션 수행",
  ],
  schedule: {
    summary: "평일 19시 이후 / 주말 약속 없으면 일찍 / 휴방 랜덤",
    bullets: ["평일 저녁 7시 이후", "주말 약속 없으면 일찍", "휴방 랜덤"],
  },
  recentQuotes: [
    "허락은 절대 포기안해",
    "오늘은 꼭 클리어 하고 만다 하드아스마르",
  ],
};

export const platforms = [
  {
    id: "soop",
    label: "SOOP (메인)",
    url: "https://ch.sooplive.co.kr/hurock0101",
    note: "허락공대 SOOP",
    iconSrc: "/platform-soop.png",
    iconAlt: "SOOP",
  },
  {
    id: "chzzk",
    label: "치지직 (네이버)",
    url: "https://chzzk.naver.com/290f875e595cef717d10deeab70a8b71",
    note: "허락공대 치지직",
    iconSrc: "/platform-chzzk.png",
    iconAlt: "치지직",
  },
  {
    id: "youtube",
    label: "유튜브",
    url: "https://youtube.com/@허락공대",
    note: "VOD / 클립",
    iconSrc: "/platform-youtube.png",
    iconAlt: "유튜브",
  },
];

export const chatRooms = [
  {
    id: "announce",
    label: "방송 공지 / 일정 알림방",
    url: "https://open.kakao.com/o/gSGi8myh",
    primary: true,
  },
  {
    id: "dm",
    label: "허락 1:1 오픈 채팅",
    url: "https://open.kakao.com/o/s8W56myh",
    primary: false,
  },
];

/**
 * 후원 / 도네이션 (toon.donate).
 * 시청자가 방송 중 후원 시 perks 의 트리거에 따라 인게임/방송 이벤트.
 */
export const sponsor = {
  label: "후원하기",
  shortLabel: "후원",
  url: "https://toon.donate/dnfmhurock",
  perkHeadline: "2000원 뽑기박스 룰렛 추가",
  perks: [
    { amount: "2000원", trigger: "뽑기박스 룰렛 추가" },
  ],
};

export const hero = {
  kicker: "HUROCK BROADCAST",
  philosophy: "즐겁게 게임하자",
  headlineSegments: [
    { text: "허락공대,", style: "plain" },
    { text: "즐겁게", style: "plain" },
    { text: "게임하자", style: "mark" },
  ],
  body:
    "평일 19시 이후 / 주말은 일찍 켭니다. 뉴비·부캐 컨설팅, 레이드 도전, 미션, 강화 / 상자깡까지. SOOP·치지직·유튜브 동시 운영.",
  portraitName: "허락",
  portraitNote: "오늘도 방송 켭니다",
  primaryActions: [
    { label: "SOOP", url: "https://ch.sooplive.co.kr/hurock0101", tone: "primary" },
    { label: "치지직", url: "https://chzzk.naver.com/290f875e595cef717d10deeab70a8b71", tone: "accent" },
    { label: "유튜브", url: "https://youtube.com/@허락공대", tone: "cyan" },
  ],
};

export const liveCards = [
  {
    id: "live-soop",
    state: "scheduled",
    title: "SOOP 라이브 — 메인 방송",
    body: "평일 19시 이후 / 주말 일찍. 던파 모바일 뉴비 컨설팅 + 레이드 도전.",
    meta: ["평일 19시+", "SOOP"],
    cta: { label: "SOOP 채널", url: "https://ch.sooplive.co.kr/hurock0101" },
    platformId: "soop",
  },
  {
    id: "live-chzzk",
    state: "scheduled",
    title: "치지직 — 동시 송출",
    body: "네이버 치지직에도 동시 송출. 채팅·다시보기 OK.",
    meta: ["네이버 치지직"],
    cta: { label: "치지직 채널", url: "https://chzzk.naver.com/290f875e595cef717d10deeab70a8b71" },
    platformId: "chzzk",
  },
  {
    id: "live-youtube",
    state: "vod",
    title: "유튜브 — 다시보기 / 클립",
    body: "최근 라이브 다시보기 + 던파 모바일 가이드 클립.",
    meta: ["VOD", "@허락공대"],
    cta: { label: "유튜브 채널", url: "https://youtube.com/@허락공대" },
    platformId: "youtube",
  },
];

/**
 * 콘테스트 목록/상세/참가작/결과는 backend API 실 데이터만 사용한다.
 * 과거 정적 샘플 데이터는 재유입 방지를 위해 보관하지 않는다.
 */
export const contests = [];

/**
 * `GET /sites/hurock/contests/:id/entries` 의 실 응답만 사용한다.
 * 기존 import 호환용으로 빈 object 만 유지.
 */
export const contestEntries = {};

// 결과 발표 — 폐기 (2026-05-14). backend `GET /sites/hurock/contests/:id/results`.
export const contestResults = {};

export const boardCategories = ["전체", "잡담", "공략질문", "콘테스트", "방송클립", "신고/건의"];

/**
 * 프로필/어드민 상세 데이터는 각 페이지에서 backend API 실 응답만 사용한다.
 */
export const adminMenu = [
  { id: "live", label: "방송 운영실", href: "/admin/live", note: "진행 이벤트·질문·추첨 현황" },
  { id: "contests", label: "콘테스트 관리", href: "/admin", note: "생성/심사/투표/발표" },
  { id: "questions", label: "질문 큐", href: "/admin/questions", note: "방송 질문 선별·OBS 송출" },
  { id: "draws", label: "추첨 기록", href: "/admin/draws", note: "서버 추첨 실행·회차 보관" },
  { id: "board", label: "게시판 관리", href: "/admin/board", note: "최근 글 목록 + 즉시 삭제" },
  { id: "reports", label: "신고함", href: "/admin/reports", note: "신고 검토 + 조치 + 운영 메모" },
  { id: "members", label: "회원 관리", href: "/admin/members", note: "자체 가입자 비밀번호 복구" },
  { id: "settings", label: "사이트 설정", href: "/admin/settings", note: "배너·채널·후원·풋터" }
];
