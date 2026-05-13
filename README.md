# dnfm-allow

`allow.dnfm.kr` — 허락님 스트리머 페이지 + 시청자 참여 이벤트 (콘테스트/투표/경품).

## 구조

- `src/app/` — Next.js App Router
- `src/components/` — 컴포넌트
- `src/lib/content.js` — 정적 콘텐츠 SSOT (hero / 프로필 / 공지 placeholder)
- `docs/` — 도메인 라우팅 / 배포 가이드

자매 사이트 `dnfm.kr` 은 **별도 repo** [`guswls3028-art/dnfm`](https://github.com/guswls3028-art/dnfm) 에서 독립 운영. 한쪽 작업이 다른쪽에 영향 0.

## 실행

```bash
pnpm install
pnpm dev      # http://localhost:3001
pnpm build    # standalone output
pnpm start    # production preview (포트 3001)
```

## 배포

EC2 단일 인스턴스 + Cloudflare CDN. 자매 사이트와 같은 EC2 인스턴스에 다른 포트(3001)·다른 디렉토리로 동거. 절차는 `docs/deploy-ec2.md`.

## 운영 메모

- 핵심 운영자 = **허락님 본인**. 어드민 UI 만으로 콘테스트 생성·심사·투표·발표 가능해야 함 (방장 없이 돌아가야 함).
- 디자인 톤 = B급 감성. 정돈된 공식 톤 X.
- 외부 링크 placeholder = `url: null` + `reason`. 확정되면 채움.
