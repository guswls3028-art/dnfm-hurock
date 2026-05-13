/**
 * allow.dnfm.kr — 정적 콘텐츠 SSOT
 *
 * 허락님(스트리머) placeholder + 콘테스트/게시판/회원 mock 데이터.
 * 외부 URL placeholder 는 `url: null` + `reason` 패턴 유지.
 * 사진/방송 URL/철학 텍스트는 사용자가 추후 채움.
 */

export const siteMeta = {
  id: "hurock",
  legacyId: "allow",
  hostnames: ["hurock.dnfm.kr", "allow.dnfm.kr"],
  brand: "허락공대",
  brandShort: "허락공대",
  wordmark: "허락공대",
  tagline: "던파 모바일 인터넷 방송",
  footerNote:
    "허락공대 (hurock.dnfm.kr) 은 인터넷 방송인 허락의 비공식 팬 페이지 겸 방송 동선 정리 페이지입니다. 게임 관련 상표권은 각 권리자에게 있으며, 본 페이지는 어떠한 공식 인증도 받지 않았습니다."
};

// 헤더 상단 nav 제거 — 빈 배열 (호환). 진입은 첫 화면 게시판 카테고리/콘테스트 카드로.
export const navItems = [];

export const siblingSite = {
  label: "뉴비 훈련소",
  href: "https://dnfm.kr",
  note: "던파 모바일 입문 가이드 (연결 플랫폼)"
};

// 최상단 슬라이딩 배너 — 5초 자동 회전. 뉴비훈련소 + 아스시로코 클럽.
export const heroBanners = [
  {
    id: "newbie",
    title: "뉴비 훈련소",
    subtitle: "던파 모바일 입문 가이드 — dnfm.kr",
    src: "/openchat-newbie-banner.png",
    alt: "뉴비 훈련소 배너",
    href: "https://dnfm.kr",
  },
  {
    id: "asicoroco",
    title: "아스시로코 클럽",
    subtitle: "허락 운영 오픈채팅",
    src: "/openchat-jaehae-banner.png",
    alt: "아스시로코 클럽 배너",
    href: "https://open.kakao.com/o/gITUzMWg",
  },
];

// 첫 랜딩 게시판 카테고리 5종 (방송채널 카드 위치). 클릭 → /board?category={key}
export const boardEntryCategories = [
  { key: "event",  label: "이벤트",  emoji: "🎉", tone: "pink",  note: "콘테스트 / 추첨 / 미션" },
  { key: "match",  label: "대회",   emoji: "🏆", tone: "amber", note: "팟 / 경합 일정" },
  { key: "chat",   label: "잡담",   emoji: "💬", tone: "cyan",  note: "자유 수다" },
  { key: "clip",   label: "클립",   emoji: "🎬", tone: "lime",  note: "방송 다시보기 / URL 연동" },
  { key: "report", label: "신고건의", emoji: "🛠️", tone: "ink", note: "버그 / 운영 건의" },
];

export const loginProviders = [
  { id: "self", label: "허락 계정으로 로그인", note: "이메일/비번 (준비중)" },
  { id: "google", label: "Google 로그인", note: "OAuth 연결 예정" },
  { id: "kakao", label: "카카오 로그인", note: "카카오 디벨로퍼스 연결 예정" }
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
    subtitle: "5개 부문 코디 자랑 — 사용자 투표 + 허락 심사",
    status: "submission",
    statusLabel: "참가 모집중",
    tone: "pink",
    posterEmoji: "👗",
    eventAt: "2026-06-13 (토) 19:00",
    submissionCloses: "6월 13일(토) 저녁 7시 방송 시작 전",
    voteWindow: "방송 중 — 부문별 시청자 1인 1표",
    resultsAt: "당일 방송 중 발표 (사용자 투표 + 허락 심사)",
    prizePool: "총합 30만원 + α — 구글 기프트 카드",
    entries: 14,
    description:
      "허락 아바타 콘테스트 1회. 가지고 있는 아바타로 5개 부문 중 골라서 참가. 1~5부문 중복 참가 가능 (단 부문별 1개 코디만). 마감 후 회원이 부문별 1회씩 투표하고, 허락이 방송 중 직접 심사해 1등을 가립니다.",
    judging: {
      summary: "사용자 투표 메인 + 허락 심사 (방송 중)",
      bullets: [
        "1차 — 마감 후 후보 전원 공개. 회원이 부문별 1인 1표 투표",
        "2차 — 6월 13일(토) 19시 방송에서 허락이 직접 심사",
        "최종 — 부문별 1등(나만의 멋진 코디는 1·2등) 구글 기프트 카드 지급"
      ]
    },
    rules: [
      "허락이 심사하는데에 불만/급발진하는 사람은 바로 탈락 (강퇴 가능)",
      "상품 걸고 재미로 노는 컨텐츠 — 가볍게 참가하기",
      "시작일자(6월 13일 토 19시) 방송 안 보고 있으면 상품 지급 불가",
      "아바타 쇼룸 불가 — 가지고 있는 아바타로 참가",
      "1~5번 부문 중복 참가 가능 (한 사람이 여러 부문 참가 OK)",
      "각 부문별 1개 코디만 참가 가능",
      "코디 설명은 디테일하게. 어디를 중점적으로 보면 좋을지도 적어주세요"
    ],
    categories: [
      {
        key: "comic",
        label: "1. 코믹 컨셉 아바타 코스프레",
        emoji: "🤡",
        note: "가장 웃기게 코디한 사람 1등",
        prize: "구글 기프트 50,000원",
        winners: 1
      },
      {
        key: "sexy",
        label: "2. 섹시 컨셉 아바타 코스프레",
        emoji: "💋",
        note: "그냥 벗기는 게 아닌 섹시한 코디 — 코디에 따라 남캐도 1등 가능",
        prize: "구글 기프트 50,000원",
        winners: 1
      },
      {
        key: "anime-male",
        label: "3. 남캐 애니 아바타 코스프레",
        emoji: "🧝‍♂️",
        note: "참고한 애니 사진 첨부 필수. 싱크로율 / 흔하지 않은 / 허락이 알만한 (애니 많이 안 봤음)",
        prize: "구글 기프트 50,000원",
        winners: 1
      },
      {
        key: "anime-female",
        label: "4. 여캐 애니 아바타 코스프레",
        emoji: "🧝‍♀️",
        note: "참고한 애니 사진 첨부 필수. 싱크로율 / 흔하지 않은 / 허락이 알만한 (애니 많이 안 봤음)",
        prize: "구글 기프트 50,000원",
        winners: 1
      },
      {
        key: "epic",
        label: "5. 나만의 가장 멋진 코디",
        emoji: "✨",
        note: "애니 코스프레 X, 웃긴 거 X. 진짜 잘 꾸민 코디 (남/여 무관)",
        prizes: [
          { rank: 1, label: "1등", reward: "구글 기프트 50,000원 + α" },
          { rank: 2, label: "2등", reward: "구글 기프트 50,000원" }
        ],
        winners: 2
      }
    ],
    rewards: [
      "총합 30만원 + α — 구글 기프트 카드",
      "1~4부문: 각 1등 1명 — 구글 기프트 50,000원",
      "5부문(나만의 멋진 코디): 1등 50,000원 + α / 2등 50,000원",
      "심사: 회원 부문별 1표 투표 + 허락 방송 중 심사"
    ],
    formSchema: [
      {
        key: "category",
        label: "참가 부문",
        required: true,
        type: "select",
        options: [
          { value: "comic", label: "1. 코믹 컨셉" },
          { value: "sexy", label: "2. 섹시 컨셉" },
          { value: "anime-male", label: "3. 남캐 애니 코스프레" },
          { value: "anime-female", label: "4. 여캐 애니 코스프레" },
          { value: "epic", label: "5. 나만의 가장 멋진 코디" }
        ]
      },
      { key: "adventureName", label: "모험단명", required: true, prefillFrom: "dnfProfile.adventureName" },
      {
        key: "characterName",
        label: "참가 캐릭터명",
        required: true,
        type: "select-or-input",
        prefillFrom: "dnfProfile.mainCharacterName",
        optionsFrom: "dnfProfile.characters",
        optionLabelKey: "name",
        help: "회원가입 OCR로 등록된 캐릭터 목록에서 선택. 없으면 직접 입력."
      },
      {
        key: "watchPlatform",
        label: "시청 플랫폼",
        required: true,
        type: "select",
        prefillFrom: "watchAccount.platform",
        options: [
          { value: "soop", label: "SOOP" },
          { value: "chzzk", label: "치지직" },
          { value: "youtube", label: "유튜브" }
        ]
      },
      {
        key: "watchNickname",
        label: "플랫폼 닉네임",
        required: true,
        prefillFrom: "watchAccount.nickname",
        placeholder: "방송 채팅에서 쓰는 닉네임"
      },
      {
        key: "title",
        label: "코디 제목",
        required: true,
        placeholder: "한 줄로 요약 — 게시글 제목: [참가 캐릭터명 / 코디 제목]"
      },
      {
        key: "description",
        label: "코디 설명",
        required: true,
        type: "textarea",
        placeholder: "어디를 중점적으로 보면 좋을지 / 컨셉 / 포인트 아이템 / 이야기 — 디테일하게"
      },
      {
        key: "photoLook",
        label: "참가 사진 (인벤토리 - 아바타 탭)",
        required: true,
        type: "photo",
        accept: "image/*",
        help: "인벤토리 → 아바타 탭 스크린샷. 박스를 드래그해서 표시 영역을 잘라요. 원본은 그대로 저장됩니다."
      },
      {
        key: "photoAnimeRef",
        label: "참고한 애니 원본 스크린",
        required: true,
        type: "photo",
        accept: "image/*",
        help: "애니 코스프레 부문 필수 — 흉내낸 애니/만화 원본 캐릭터 스크린샷 1장.",
        showWhen: { field: "category", in: ["anime-male", "anime-female"] }
      }
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
