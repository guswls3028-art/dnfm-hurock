# dnfm-hurock Project

## A. Project Overview

- **Stack**: Next.js 15.5.7 (App Router, standalone) + React 19, Node 20.
- **사이트**: `hurock.dnfm.kr` — 인터넷 방송인 **허락님** 의 방송/이벤트 페이지. 던파 모바일 스트리머.
- **본업**: 방송 페이지 + 시청자 참여형 이벤트 (콘테스트, 투표, 경품).
- **운영 주체 — self-service 가 절대 요구**: 허락님(비개발자) 이 평소 운영. 방장(친구들 운영자) 도 봐주긴 하지만 **방장 없이 돌아가야 함**. 어드민 UI 만으로 콘테스트 생성·마감·심사·투표·발표 가능해야 함.
- **디자인**: B급 감성. 친구들 newb 의 라이트 톤과 의도적으로 다름.
- **친구들**: `dnfm.kr` — 별도 git repo (`guswls3028-art/dnfm`). frontend 코드/디자인 시스템 완전 격리. 공유 = backend api (Stage 2 `api.dnfm.kr`) + 회원/세션 (쿠키 `.dnfm.kr`) + R2 뿐.
- **호스팅**: EC2 단일 인스턴스 (포트 3001) + Cloudflare proxy.
- **Git**: `https://github.com/guswls3028-art/dnfm-hurock`.
- **현재 버전**: 0.1.0.

## B. Workflow

**inspect → edit → local dev rendering → local E2E → deploy → 검증 → summarize**
- Do NOT: inspect → ask confirmation → wait. 확인 질문은 failure mode.
- **local dev rendering**: build 통과 ≠ 정상. 실제 렌더링 확인 후 E2E.
- **E2E**: 격리 환경, `[E2E-{timestamp}]` 태그, cleanup 필수.

### B-1. Manual Deploy (CI 자동화 불가 상태)

EC2 SG inbound 22 = 사용자 IP only — GitHub runner 차단. GitHub Actions `Build & Deploy to EC2` workflow 는 `workflow_dispatch` 만 등록. 일반 배포는 사용자 머신에서 직접:

```bash
cd C:/academy/dnfm/hurock
pnpm build                                                # output: "standalone" 강제
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
tar -czf /tmp/standalone.tgz -C .next standalone
scp -i /tmp/dnfm/ic /tmp/standalone.tgz ec2-user@43.202.246.97:/tmp/
ssh -i /tmp/dnfm/ic ec2-user@43.202.246.97 \
  'cd /var/www/dnfm-hurock && rm -rf .next/standalone \
   && tar -xzf /tmp/standalone.tgz -C .next/ \
   && pm2 restart dnfm-hurock --update-env \
   && curl -sk -H "Host: hurock.dnfm.kr" https://127.0.0.1/ -o /dev/null -w "smoke %{http_code}\n"'
```

EC2 좌표 SSOT: `C:/academy/dnfm/api/docs/deployment-credentials.md` §0.

## C. Harness Architecture

역할 분리 아님 — **관심사 계층화.** AI는 모든 관심사를 동시에 적용.

**우선순위 (충돌 시)**:
1. 사용자 즉시 지시
2. `anti-avoidance.md` — 회피 방지 메타룰
3. `core.md`
4. 그 외 `.claude/rules/*`
5. `~/.claude/projects/.../memory/`
6. CLAUDE.md
7. 추론

```
.claude/rules/
  anti-avoidance.md / core.md / code-quality.md / ui-quality.md /
  completion-criteria.md / collaboration-policy.md / codex-delegation.md
```

## D. Reference System

- **Rules**: `.claude/rules/` — 자동 로딩.
- **Domains**: `.claude/domains/allow.md` — 본 사이트 비즈니스 mental model.
- **Context (on-demand)**: `.claude/context/` — 비어 있음.
- Ignore: `node_modules/`, `.next/`, `dist/`, `build/`, `.cache/`, `_artifacts/`

## E. 친구들 격리 정책 (절대)

- `dnfm.kr` 은 **별도 repo (`dnfm`)**. 이 repo 와 frontend·디자인 시스템 무관.
- 이 repo 에서 newb 코드를 read/import/참고 X.
- cross-link 는 hardcoded URL (`https://dnfm.kr`) 만. newb 의 컴포넌트/타입 import X.
- 디자인 시스템 변경은 이 repo 안에서만. 친구들 영향 0 보장.

## F. 도메인 정책

- 정적 콘텐츠 (hero/프로필/철학/공지 placeholder): `src/lib/content.js`. 허락님이 보내준 정보를 사용자가 1회 수기 박음. 이후는 어드민 UI.
- 동적 콘텐츠 (콘테스트, 글, 사진, 투표, 경품 이력): Stage 2 backend (`api.dnfm.kr`) 필수.
- 외부 링크 placeholder = `url: null` + `reason`.
- B급 감성 톤 유지. 공식 던파 wordmark / 공식 게시판 카테고리 directly copy 금지.
- 도메인 라우팅: `docs/domain-routing.md`. 배포: `docs/deploy-ec2.md`.

## G. 단계별 로드맵

- **Stage 1 (현재)**: 정적 사이트 EC2 standalone + Cloudflare 선배포.
- **Stage 2**: backend `api.dnfm.kr` (별도 repo) — 인증, R2 presign, 게시판/콘테스트/투표 API.
- **Stage 3**: 커뮤니티 풀 UI — 회원 가입/로그인, 게시판, 댓글, 좋아요, 검색, 알림, 마이페이지, 어드민.
- **Stage 4 — 핵심 기능**: **아바타 콘테스트** (참가 글쓰기 + 마감 컷 + 어드민 심사 + 투표 + 등수).
- **Stage 5**: 경품 이벤트 (추첨 풀, 당첨자 히스토리), 라이브 임베드, newb 메인 1줄 카드 (cross-link 중간).
- **Stage 6**: CI quality gate, EC2 자동 배포 webhook.

---

## 📌 Next Session Entry — 필독 (이 줄을 무시하지 말 것)

**자격증명·배포·인프라 좌표 SSOT** → `C:\academy\dnfm\api\docs\deployment-credentials.md`

해당 파일 한 곳에 정리됨:
- 라이브 EC2 IP / SSH key / .env 경로 / PM2 / Nginx / R2 / Cloudflare zone
- 자격증명 현황표 (✅ 주입 완료 / ❌ empty / 🟡 미확인) — EC2 `.env` 실측 기준
- 새로 발급해야 할 cred 절차 (Kakao OAuth / Cloudflare Origin Cert / Vision API)
- 다음 세션 진입 조건 A/B/C
- 흩어진 자료 인덱스

allow 단독 작업이라도 backend `.env` / EC2 / Cloudflare 관련 신호 마주치면 그 파일부터 확인.

**같은 그룹 sibling repo (별도 git remote, frontend 코드는 완전 독립):**
- `C:\academy\dnfm\newb\` — 던파+군대 뉴비 페이지 (dnfm.kr)
- `C:\academy\dnfm\api\` — 공용 backend (api.dnfm.kr)
