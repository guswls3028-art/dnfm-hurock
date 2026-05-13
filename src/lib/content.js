export const site = {
  id: "allow",
  hostnames: ["allow.dnfm.kr"],
  title: "허락",
  shortTitle: "허락",
  eyebrow: "allow.dnfm.kr",
  subtitle: "방송 공지, 링크, 커뮤니티 동선을 정리하는 스트리머 페이지",
  theme: "allow",
  hero: {
    kicker: "CREATOR ROOM",
    headline: "허락님의 방송 동선을 단정하게",
    headlineLines: ["허락님의", "방송 동선을", "단정하게"],
    body:
      "방송 링크, 공지, 다시보기, 커뮤니티 안내를 한 페이지에 배치합니다. 채널 URL이 확정되면 버튼만 켜면 됩니다.",
    calloutTitle: "서브도메인 준비",
    calloutBody:
      "Next.js 라우팅 기준으로 `allow.dnfm.kr` 커스텀 도메인을 같은 앱에 연결하면 자동으로 이 화면이 열립니다."
  },
  actions: [
    { label: "라이브 채널", url: null, reason: "채널 URL 등록 전" },
    { label: "유튜브", url: null, reason: "유튜브 URL 등록 전" },
    { label: "공지 보기", url: "#notice-board", note: "페이지 내 공지" },
    { label: "문의 메일", url: "mailto:allow@dnfm.kr" }
  ],
  stats: [
    { value: "LIVE", label: "방송 링크", detail: "등록 대기" },
    { value: "VOD", label: "다시보기", detail: "등록 대기" },
    { value: "DNFM", label: "커뮤니티 연결", detail: "뉴비 훈련소 연동" }
  ],
  briefing: [
    {
      title: "첫 화면은 방송 입장",
      body: "방문자가 가장 먼저 라이브 채널과 최근 공지를 확인하도록 구성했습니다.",
      accent: "red"
    },
    {
      title: "콘텐츠 묶음",
      body: "던파 모바일 방송, 공략, 합방, 클립을 섹션으로 나눌 수 있게 했습니다.",
      accent: "amber"
    },
    {
      title: "도메인 분리",
      body: "메인 커뮤니티와 스트리머 페이지가 같은 코드베이스를 쓰되 폴더와 배포 프로젝트를 나눕니다.",
      accent: "mint"
    }
  ],
  checklistKey: "dnfm-allow-checklist",
  checklistTitle: "페이지 공개 전 체크",
  checklist: [
    "라이브 채널 URL 등록",
    "유튜브 또는 다시보기 URL 등록",
    "프로필 이미지와 소개 문구 확정",
    "문의 메일 수신 확인"
  ],
  guideFilters: ["전체", "방송", "공지", "공략", "커뮤니티"],
  guides: [
    {
      title: "방송 일정",
      category: "방송",
      body: "요일별 고정 방송 시간이 생기면 이 카드가 일정표로 확장됩니다.",
      linkLabel: "일정 준비중",
      url: null
    },
    {
      title: "최근 공지",
      category: "공지",
      body: "휴방, 이벤트, 합방 안내를 가장 짧은 문장으로 고정하는 영역입니다.",
      linkLabel: "공지 보드",
      url: "#notice-board"
    },
    {
      title: "던파 모바일 공략",
      category: "공략",
      body: "직업, 장비, 레이드 공략 영상을 묶어 둘 수 있는 재생목록 슬롯입니다.",
      linkLabel: "재생목록 준비중",
      url: null
    },
    {
      title: "뉴비 훈련소 연결",
      category: "커뮤니티",
      body: "방송 유입이 질문방으로 자연스럽게 넘어가도록 메인 허브와 연결합니다.",
      linkLabel: "dnfm.kr 이동",
      url: "https://dnfm.kr/"
    }
  ],
  linkGroups: [
    {
      title: "허락 채널",
      links: [
        { label: "라이브", url: null, reason: "채널 URL 등록 전" },
        { label: "유튜브", url: null, reason: "유튜브 URL 등록 전" },
        { label: "클립", url: null, reason: "클립 URL 등록 전" }
      ]
    },
    {
      title: "연결",
      links: [
        { label: "뉴비 훈련소", url: "https://dnfm.kr/" },
        { label: "공식 홈페이지", url: "https://dnfm.nexon.com/" },
        { label: "문의", url: "mailto:allow@dnfm.kr" }
      ]
    }
  ],
  timelineTitle: "공지 보드",
  timelineId: "notice-board",
  timeline: [
    {
      time: "고정",
      title: "채널 링크 등록 예정",
      body: "확정된 방송 플랫폼 URL을 받으면 버튼과 링크 보드를 함께 갱신합니다."
    },
    {
      time: "준비",
      title: "소개 문구 확인",
      body: "방송 톤, 주 콘텐츠, 문의 방식이 정해지면 첫 문장을 더 선명하게 바꿉니다."
    },
    {
      time: "배포",
      title: "allow.dnfm.kr 연결",
      body: "DNS와 배포 플랫폼의 커스텀 도메인을 연결한 뒤 모바일에서 최종 확인합니다."
    }
  ],
  footerNote: "이 페이지는 dnfm.kr 하위 스트리머 페이지 템플릿입니다."
};
