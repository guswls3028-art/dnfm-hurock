"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth, oauth } from "@/lib/api-client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // OAuth provider 사전 점검 — 미설정이면 disabled + 안내.
  // 운영 .env: GOOGLE_OAUTH_CLIENT_ID set, KAKAO_OAUTH_CLIENT_ID empty (2026-05-13 기준).
  async function probeOAuth(provider, url) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "manual" });
      if (res.status === 503) {
        setError({
          message: `${provider === "kakao" ? "카카오" : "구글"} 로그인은 아직 준비 중입니다. 잠시만 기다려 주세요.`,
        });
        return false;
      }
    } catch {
      // network 에러는 통과시켜 brower 가 그대로 redirect 시도하게.
    }
    return true;
  }

  async function handleOAuthClick(e, provider, url) {
    e.preventDefault();
    setError(null);
    const ok = await probeOAuth(provider, url);
    if (!ok) return;
    window.location.href = url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.username || !form.password) {
      setError({ message: "아이디 / 비번을 입력해 주세요." });
      return;
    }
    setBusy(true);
    try {
      await auth.loginLocal({ username: form.username, password: form.password });
      router.push(returnTo);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      else setError({ message: err?.message || "로그인 실패" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell activePath="/login">
      <div className="page-head">
        <div>
          <h1>로그인 / 입장</h1>
          <p>허락방에서 콘테스트 참가하고 글 쓰려면 로그인이 필요해요.</p>
        </div>
        <StickerBadge tone="cyan" rotate="r">
          소셜 로그인 OK
        </StickerBadge>
      </div>

      <div className="grid grid-2">
        <form
          className="form-block"
          onSubmit={handleSubmit}
          aria-label="자체 로그인 폼"
        >
          <div className="form-step">자체 계정</div>
          <div className="form-row">
            <label htmlFor="login-username">아이디</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="가입할 때 정한 아이디"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="login-pw">비밀번호</label>
            <input
              id="login-pw"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="4자 이상"
              required
            />
            <small>최소 4자. 짧아도 괜찮아요 — brute force 방어는 서버에서.</small>
          </div>

          {error && (
            <div className="callout-box is-pending">
              <strong>로그인 실패</strong>
              {error.message || "다시 시도해 주세요."}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "로그인 중…" : "로그인"}
          </button>
          <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              style={{
                borderBottom: "2px solid var(--primary)",
                color: "var(--primary-ink)",
                fontWeight: 800,
              }}
            >
              가입하기
            </Link>
          </div>
        </form>

        <div className="form-block">
          <div className="form-step">소셜 로그인</div>
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.88rem", lineHeight: 1.6 }}>
            구글 / 카카오 계정으로 한 번에 입장. 처음 로그인하면 자동으로 가입됩니다.
          </p>
          <a
            href={oauth.googleStart(returnTo)}
            className="btn btn-google"
            style={{ justifyContent: "flex-start" }}
            onClick={(e) =>
              handleOAuthClick(e, "google", oauth.googleStart(returnTo))
            }
          >
            <span aria-hidden="true" style={{ fontWeight: 900 }}>G</span>
            Google 로 계속하기
          </a>
          <a
            href={oauth.kakaoStart(returnTo)}
            className="btn btn-kakao"
            style={{ justifyContent: "flex-start" }}
            onClick={(e) =>
              handleOAuthClick(e, "kakao", oauth.kakaoStart(returnTo))
            }
          >
            <span aria-hidden="true" style={{ fontWeight: 900 }}>K</span>
            카카오로 계속하기
          </a>
          <div className="callout-box">
            <strong>처음이신가요?</strong>
            소셜 로그인은 1단계 가입 후 던파 캡처 인증(2단계)로 안내됩니다.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageShell activePath="/login"><div className="page-head"><h1>로그인</h1></div></PageShell>}>
      <LoginInner />
    </Suspense>
  );
}
