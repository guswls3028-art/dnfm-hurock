# EC2 + Cloudflare 배포 가이드 (dnfm-allow)

이 repo (`dnfm-allow`, `allow.dnfm.kr`) 를 EC2 + Cloudflare proxy 로 띄우는 절차.
자매 사이트 `dnfm-newb` 와 같은 EC2 인스턴스 안에 다른 디렉토리·다른 포트(3001)로 동거. 본 repo 작업으로 자매 사이트 흔들 일 없음.

## 0. 사전

- EC2 인스턴스 (자매 사이트 이미 셋업되어 있으면 그대로 재사용)
- Cloudflare zone `dnfm.kr` (자매 사이트와 공유)
- 도메인 1건: `allow.dnfm.kr`

## 1. EC2 초기 셋업 (자매 사이트가 이미 했다면 skip)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm@9 pm2
```

## 2. 레포 클론 + 빌드

```bash
sudo mkdir -p /var/www/dnfm-allow
sudo chown -R ubuntu:ubuntu /var/www/dnfm-allow
cd /var/www/dnfm-allow
git clone https://github.com/guswls3028-art/dnfm-allow.git .
pnpm install --frozen-lockfile
pnpm build

# standalone 산출물에 static + public 복사
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
```

## 3. PM2

`/var/www/dnfm-allow/ecosystem.config.cjs`:
```js
module.exports = {
  apps: [{
    name: "dnfm-allow",
    script: ".next/standalone/server.js",
    cwd: __dirname,
    env: { PORT: 3001, HOSTNAME: "127.0.0.1", NODE_ENV: "production" }
  }]
};
```

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## 4. Nginx server block

`/etc/nginx/sites-available/dnfm-allow.conf`:
```nginx
server {
    listen 80;
    server_name allow.dnfm.kr;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dnfm-allow.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Cloudflare 콘솔

- DNS A 레코드 1건 (`allow`) → EC2 public IP, **proxy ON (orange)**
- SSL/TLS = Full (strict). 자매 사이트와 같은 Origin Certificate 또는 Let's Encrypt.
- Cache Rules: 자매 사이트 정책 그대로 — static/image 장기, HTML bypass.

## 6. 재배포 스크립트

`/var/www/dnfm-allow/scripts/deploy.sh`:
```bash
#!/bin/bash
set -e
cd /var/www/dnfm-allow
git pull origin main
pnpm install --frozen-lockfile
pnpm build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/ 2>/dev/null || true
pm2 reload ecosystem.config.cjs
```

## 7. 검증

```bash
curl -I https://allow.dnfm.kr
# 200 + cf-ray 헤더 + HTML
```

브라우저 실제 렌더링 (B급 감성 톤 살아있는지) 까지 확인해야 끝.
