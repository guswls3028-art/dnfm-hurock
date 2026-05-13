/**
 * allow.dnfm.kr — 정적 콘텐츠 SSOT
 *
 * 허락님(스트리머) placeholder + 콘테스트/게시판/회원 mock 데이터.
 * 외부 URL placeholder 는 `url: null` + `reason` 패턴 유지.
 * 사진/방송 URL/철학 텍스트는 사용자가 추후 채움.
 */

export const siteMeta = {
  id: "allow",
  hostnames: ["allow.dnfm.kr"],
  brand: "허락",
  brandShort: "허락",
  wordmark: "허락!",
  tagline: "던파 모바일 인터넷 방송",
  footerNote:
    "허락 (allow.dnfm.kr) 은 인터넷 방송인 허락의 비공식 팬 페이지 겸 방송 동선 정리 페이지입니다. 게임 관련 상표권은 각 권리자에게 있으며, 본 페이지는 어떠한 공식 인증도 받지 않았습니다."
};

export const navItems = [
  { href: "/", label: "홈" },
  { href: "/contests", label: "콘테스트" },
  { href: "/board", label: "허락방" },
  { href: "/profile", label: "내 페이지" }
];

export const siblingSite = {
  label: "뉴비 훈련소",
  href: "https://dnfm.kr",
  note: "던파 모바일 입문 가이드 (자매 사이트)"
};

export const loginProviders = [
  { id: "self", label: "허락 계정으로 로그인", note: "이메일/비번 (준비중)" },
  { id: "google", label: "Google 로그인", note: "OAuth 연결 예정" },
  { id: "kakao", label: "카카오 로그인", note: "카카오 디벨로퍼스 연결 예정" }
];

/**
 * 허락님 hero 영역 — 사용자가 사진/철학/방송 URL 받은 뒤 채움.
 * 현재는 placeholder. url: null + reason 으로 비활성 명시.
 */
export const hero = {
  kicker: "ALLOW BROADCAST",
  // headline 의 segments 는 SiteHero 에서 sticker/strike 스타일 분기.
  headlineSegments: [
    { text: "허락의 던파모바일,", style: "plain" },
    { text: "방송에 놀러", style: "plain" },
    { text: "오세요", style: "mark" }
  ],
  body:
    "방송 시간이 정해지면 라이브 카드부터 켜집니다. 그동안엔 아바타 콘테스트로 시청자분들이 코디 자랑하실 수 있게 페이지를 열어 둘게요.",
  portraitName: "허락",
  portraitNote: "프로필 사진 등록 전",
  primaryActions: [
    { label: "라이브 입장", url: null, reason: "방송 URL 등록 전" },
    { label: "콘테스트 보러가기", url: "/contests", tone: "accent" },
    { label: "허락방 글쓰기", url: "/board/new", tone: "cyan" }
  ]
};

export const liveCards = [
  {
    id: "live-1",
    state: "scheduled",
    title: "오늘 방송 — 신규 던전 도전",
    body: "방송 URL이 등록되면 이 카드에서 바로 입장할 수 있게 됩니다.",
    meta: ["요일 미정", "플랫폼 미정"],
    cta: { label: "방송 보러가기", url: null, reason: "방송 URL 등록 전" }
  },
  {
    id: "live-2",
    state: "vod",
    title: "지난 방송 다시보기",
    body: "유튜브 / 클립 채널 연결 후 자동으로 최근 5개가 표시됩니다.",
    meta: ["VOD", "최근 30일"],
    cta: { label: "유튜브 채널", url: null, reason: "유튜브 URL 등록 전" }
  }
];

export const noticeBoard = [
  {
    id: "n1",
    pinned: true,
    title: "[필독] 허락방 이용 안내",
    body: "욕설·차별·도배·홍보 글은 신고 즉시 차단됩니다. 던파 모바일 외 주제도 환영이지만 메인은 던파 모바일이에요.",
    posted: "고정"
  },
  {
    id: "n2",
    pinned: false,
    title: "아바타 콘테스트 1회 마감 임박",
    body: "이번 주 일요일 23:59 마감입니다. 모험단명/캐릭터명/코디 제목/설명/사진 한 장이면 참가 끝.",
    posted: "준비"
  },
  {
    id: "n3",
    pinned: false,
    title: "방송 URL 곧 공개",
    body: "확정되면 헤더 'LIVE' 버튼이 색을 바꿉니다.",
    posted: "준비"
  }
];

/**
 * 콘테스트 mock — 3종 (진행중 / 종료 / 결과 발표)
 *
 * status:
 *   - "submission" : 참가 글쓰기 받는 중
 *   - "voting"     : 어드민이 후보 추리고 시청자 투표
 *   - "ended"      : 종료 (결과 미발표)
 *   - "announced"  : 결과 발표 끝
 *
 * formSchema: 참가 폼 필드. 현재는 아바타 콘테스트 고정 5필드.
 */
export const contests = [
  {
    id: "c-avatar-1",
    title: "허락 아바타 콘테스트 1회",
    subtitle: "이번 주 코디 자랑",
    status: "submission",
    statusLabel: "참가 모집중",
    tone: "pink",
    posterEmoji: "👗",
    submissionCloses: "이번 주 일요일 23:59",
    voteWindow: "마감 다음 날부터 3일",
    resultsAt: "결과 발표는 투표 마감 직후",
    entries: 14,
    description:
      "모험단명/캐릭터명/코디 제목/설명/사진 한 장. 잘 입은 코디든 망한 코디든 다 환영. 허락이 직접 후보 추려서 투표 열게요.",
    rewards: ["1등: 허락 굿즈 (준비중)", "2~3등: 디스코드 특별 뱃지", "참가자 전원: 갤러리 등재"],
    formSchema: [
      { key: "adventureName", label: "모험단명", required: true, prefillFrom: "dnfProfile.adventureName" },
      { key: "characterName", label: "캐릭터명", required: true, prefillFrom: "dnfProfile.characterName" },
      { key: "title", label: "코디 제목", required: true, placeholder: "한 줄로 요약" },
      { key: "description", label: "코디 설명", required: true, type: "textarea", placeholder: "컨셉/포인트 아이템/이야기" },
      { key: "photo", label: "코디 사진 (1장)", required: true, type: "file", accept: "image/*" }
    ]
  },
  {
    id: "c-screenshot-1",
    title: "스크린샷 한 컷",
    subtitle: "방송 중 인상깊었던 순간",
    status: "voting",
    statusLabel: "투표중",
    tone: "cyan",
    posterEmoji: "📸",
    submissionCloses: "(마감됨)",
    voteWindow: "오늘 자정까지",
    resultsAt: "내일 정오 발표",
    entries: 22,
    description:
      "방송 다시보기에서 캡처한 장면을 올려주세요. 코미디/감동/대참사 다 환영.",
    rewards: ["1등: 굿즈 추첨권", "2~3등: 닉네임 색 변경권"],
    formSchema: []
  },
  {
    id: "c-name-0",
    title: "허락방 이름 짓기",
    subtitle: "공식 별칭 공모",
    status: "announced",
    statusLabel: "결과 발표",
    tone: "amber",
    posterEmoji: "🏷️",
    submissionCloses: "(마감됨)",
    voteWindow: "(종료)",
    resultsAt: "지난 주 일요일 발표",
    entries: 38,
    description:
      "허락방 시청자 별칭을 모집했습니다. 1등은 페이지 헤더에 새겨질 예정입니다.",
    rewards: ["1등: 헤더 등재 + 굿즈", "2~3등: 닉네임 색"],
    formSchema: []
  }
];

/**
 * 콘테스트 entries mock — c-avatar-1 의 참가작 표본.
 * 마감 후/투표 페이지에서 grid 로 노출.
 */
export const contestEntries = {
  "c-avatar-1": [
    { id: "e1", adventureName: "허락팬1단", characterName: "라피헌터", title: "여름 골목 산책", description: "라이트한 셔츠+밀짚모자 조합. 컨셉은 슈퍼 가는 길.", tone: "pink" },
    { id: "e2", adventureName: "허락팬1단", characterName: "달의도사", title: "심야 작업실", description: "어두운 톤 풀세트, 안경 포인트. 코드 짜는 컨셉.", tone: "cyan" },
    { id: "e3", adventureName: "방송러", characterName: "노을검사", title: "이세계 카페", description: "파스텔 + 베레모. 분위기 카페 알바.", tone: "amber" },
    { id: "e4", adventureName: "허락팬2단", characterName: "은하술사", title: "별 보러 가는 옷", description: "은하 패턴 망토 + 별 액세서리. 야경 어울림.", tone: "lime" },
    { id: "e5", adventureName: "허락팬2단", characterName: "비오는날", title: "장마 일기", description: "노란 우비 + 장화. 비 오는 날만 입음.", tone: "pink" },
    { id: "e6", adventureName: "도전자모임", characterName: "철권왕", title: "도장깨기", description: "도복 + 머리띠. 진지하게 보이려고 노력함.", tone: "cyan" }
  ],
  "c-screenshot-1": [
    { id: "s1", adventureName: "방송시청자", characterName: "(N/A)", title: "보스 패턴 회피 실패", description: "마지막 1% 에서 누운 컷.", tone: "pink" },
    { id: "s2", adventureName: "방송시청자", characterName: "(N/A)", title: "허락 감동 장면", description: "100일 기념 멘트.", tone: "amber" },
    { id: "s3", adventureName: "방송시청자", characterName: "(N/A)", title: "채팅 단체 도배", description: "ㅋㅋㅋㅋ 가 화면을 덮은 순간.", tone: "cyan" }
  ],
  "c-name-0": []
};

/**
 * 결과 발표 mock — c-name-0
 */
export const contestResults = {
  "c-name-0": {
    podium: [
      { rank: 1, name: "허락방", by: "익명1", comment: "원안. 가장 많이 부르던 이름이라 그대로 채택." },
      { rank: 2, name: "허락 클럽", by: "익명2", comment: "느낌 좋음. 디스코드 클럽 별칭으로 추가 검토." },
      { rank: 3, name: "허락존", by: "익명3", comment: "짧고 직관적." }
    ],
    note: "투표 결과는 1인 1표 기준이며 중복 IP 는 제외했습니다."
  }
};

/**
 * 자유 게시판 mock — 디시 톤 단순화, 허락방 카테고리.
 */
export const boardCategories = ["전체", "잡담", "공략질문", "콘테스트", "방송클립", "신고/건의"];

export const boardPosts = [
  { id: 101, category: "잡담", title: "오늘 방송 몇 시?", author: "허락팬1", date: "오늘", views: 124, comments: 8 },
  { id: 102, category: "콘테스트", title: "아바타 콘테스트 참가했어요!", author: "라피헌터", date: "오늘", views: 88, comments: 3 },
  { id: 103, category: "공략질문", title: "신규 던전 보스 패턴 정리", author: "공략러", date: "어제", views: 412, comments: 22 },
  { id: 104, category: "방송클립", title: "방송 중 허락 명대사 정리.txt", author: "클립러", date: "2일 전", views: 689, comments: 41 },
  { id: 105, category: "잡담", title: "허락 굿즈 언제 나오나요", author: "굿즈갈망", date: "3일 전", views: 233, comments: 12 },
  { id: 106, category: "신고/건의", title: "[건의] 콘테스트 부문 추가 제안", author: "방송러", date: "3일 전", views: 91, comments: 5 },
  { id: 107, category: "공략질문", title: "직업 추천 좀요 (뉴비)", author: "초보모험가", date: "4일 전", views: 178, comments: 14 },
  { id: 108, category: "잡담", title: "오늘 합방하시나요?", author: "허락팬2", date: "5일 전", views: 145, comments: 6 }
];

export const boardPostDetail = {
  // 단일 mock: id 와 무관하게 동일 콘텐츠 (UI 골격 확인 목적)
  id: 103,
  category: "공략질문",
  title: "신규 던전 보스 패턴 정리",
  author: "공략러",
  date: "어제",
  views: 412,
  body:
    "신규 던전 보스 패턴 메모.\n\n1) 1페이즈: 광역기 회피만 잘 하면 됨\n2) 2페이즈: 분신 처리 우선순위 — 보라색 → 파란색 → 빨간색\n3) 3페이즈: 시간제한 있음. 딜 안 나오면 와이프\n\n허락 방송 다시보기 참고하세요.",
  comments: [
    { id: "cm1", author: "라피헌터", date: "12분 전", body: "정리 감사합니다. 저는 2페이즈에서 계속 죽음." },
    { id: "cm2", author: "달의도사", date: "1시간 전", body: "분신 처리 순서 진짜 중요함. 모르고 다 깔리면 끝." },
    { id: "cm3", author: "허락팬1", date: "3시간 전", body: "허락 방송 봤는데 첫 클리어 감동임." }
  ]
};

/**
 * 회원 마이페이지 mock.
 * dnfProfile = 가입 2단계에서 OCR 캡처 3종으로 채우는 자리.
 */
export const profileMock = {
  account: {
    nickname: "라피헌터",
    email: "demo@allow.dnfm.kr",
    joinedAt: "가입일 미정",
    provider: "자체",
    badges: ["콘테스트 참가 1회"]
  },
  dnfProfile: {
    adventureName: "허락팬1단",
    characterName: "라피헌터",
    serverName: "안톤",
    captures: [
      { key: "adventure", label: "모험단 캡처", state: "ok", note: "등록됨" },
      { key: "character", label: "캐릭터 정보 캡처", state: "ok", note: "등록됨" },
      { key: "equipment", label: "장비 캡처", state: "pending", note: "심사 대기" }
    ]
  },
  contestHistory: [
    { id: "c-avatar-1", title: "허락 아바타 콘테스트 1회", status: "submission", role: "참가자", entry: "여름 골목 산책" },
    { id: "c-name-0", title: "허락방 이름 짓기", status: "announced", role: "참가자", entry: "허락 클럽", rank: 2 }
  ]
};

/**
 * 어드민 mock — 콘테스트 entry 심사용.
 */
export const adminContestDetail = {
  contestId: "c-avatar-1",
  title: "허락 아바타 콘테스트 1회",
  status: "submission",
  statusLabel: "참가 모집중",
  entries: [
    { id: "e1", adventureName: "허락팬1단", characterName: "라피헌터", title: "여름 골목 산책", state: "pending" },
    { id: "e2", adventureName: "허락팬1단", characterName: "달의도사", title: "심야 작업실", state: "candidate" },
    { id: "e3", adventureName: "방송러", characterName: "노을검사", title: "이세계 카페", state: "pending" },
    { id: "e4", adventureName: "허락팬2단", characterName: "은하술사", title: "별 보러 가는 옷", state: "rejected", reason: "사진 식별 어려움" },
    { id: "e5", adventureName: "허락팬2단", characterName: "비오는날", title: "장마 일기", state: "candidate" },
    { id: "e6", adventureName: "도전자모임", characterName: "철권왕", title: "도장깨기", state: "pending" }
  ],
  stateLabel: {
    pending: "검수 대기",
    candidate: "후보 선정",
    rejected: "반려"
  }
};

export const adminMenu = [
  { id: "contests", label: "콘테스트 관리", href: "/admin", note: "생성/심사/투표/발표" },
  { id: "board", label: "게시판 관리", href: null, reason: "어드민 UI 준비중" },
  { id: "members", label: "회원 관리", href: null, reason: "어드민 UI 준비중" },
  { id: "settings", label: "사이트 설정", href: null, reason: "어드민 UI 준비중" }
];
