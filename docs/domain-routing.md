# 도메인 라우팅

## 호스트

- `allow.dnfm.kr` → 이 사이트 (`dnfm-allow` repo)
- `dnfm.kr`, `www.dnfm.kr` → 별도 repo (`guswls3028-art/dnfm`)
- `api.dnfm.kr` → 별도 repo (Stage 2 — `dnfm-api`)

## 인프라

```
사용자
  │
Cloudflare (proxy, orange-cloud)
  │   DNS · TLS · 캐시 · WAF
  ▼
EC2 (Nginx host 분기)
  ├─ :3000  dnfm-newb  (자매 사이트, 별도 deploy)
  ├─ :3001  dnfm-allow (이 사이트, Next.js standalone)
  └─ :4000  api        (Stage 2)
```

## Cloudflare DNS

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `allow` | `<EC2 IP>` | ON (orange) |

SSL/TLS = Full (strict). 같은 EC2 origin 인증서 공유.

Cache rules: `/_next/static/*`, `/_next/image/*`, `*.{jpg,png,svg,webp,woff2}` 장기. HTML bypass.

## 배포 흐름

1. 로컬: `pnpm install && pnpm build`.
2. `git push origin main`.
3. EC2 에서 `git pull` → `pnpm install --frozen-lockfile` → `pnpm build` → PM2 reload.
4. Nginx 가 `Host: allow.dnfm.kr` → 127.0.0.1:3001 proxy.

상세 절차: `docs/deploy-ec2.md`.
