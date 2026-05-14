"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import ViewerPlatformField from "@/components/ViewerPlatformField";
import { ApiError, apiFetch, auth } from "@/lib/api-client";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;

function validateUsername(v) {
  if (!USERNAME_PATTERN.test(v)) return "영문/숫자/언더스코어 3~32자";
  return null;
}
function validateDisplayName(v) {
  const t = v.trim();
  if (t.length < 1) return "닉네임을 입력해 주세요";
  if (t.length > 32) return "32자 이하";
  return null;
}

function useAvailability(value, paramName, validator) {
  const [state, setState] = useState({ status: "idle" });
  const timer = useRef(null);
  const reqId = useRef(0);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value) { setState({ status: "idle" }); return; }
    const err = validator(value);
    if (err) { setState({ status: "invalid", message: err }); return; }
    setState({ status: "checking" });
    const me = ++reqId.current;
    timer.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/auth/check-availability?${paramName}=${encodeURIComponent(value)}`);
        if (reqId.current !== me) return;
        setState({ status: data?.available === true ? "ok" : "taken" });
      } catch (err) {
        if (reqId.current !== me) return;
        setState({ status: "error", message: err?.message || "확인 실패" });
      }
    }, 500);
    return () => timer.current && clearTimeout(timer.current);
  }, [value, paramName, validator]);
  return state;
}

function hintLabel(state) {
  if (state.status === "checking") return { tone: "muted", text: "확인 중…" };
  if (state.status === "ok") return { tone: "ok", text: "사용 가능" };
  if (state.status === "taken") return { tone: "bad", text: "이미 사용 중" };
  if (state.status === "invalid") return { tone: "bad", text: state.message };
  if (state.status === "error") return { tone: "bad", text: state.message || "확인 실패" };
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [viewer, setViewer] = useState({ platform: null, nickname: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const passwordMatch = useMemo(() => {
    if (!password || !password2) return null;
    return password === password2 ? "ok" : "mismatch";
  }, [password, password2]);

  const u = useAvailability(username, "username", validateUsername);
  const d = useAvailability(displayName.trim(), "displayName", validateDisplayName);

  const canSubmit = useMemo(() => {
    if (!username || !password || !password2 || !displayName.trim()) return false;
    if (password.length < 4 || password !== password2) return false;
    if (u.status !== "ok" || d.status !== "ok") return false;
    if (!acceptedTerms) return false;
    return true;
  }, [username, password, password2, displayName, u.status, d.status, acceptedTerms]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !canSubmit) {
      if (!canSubmit) setError({ message: "입력값을 확인해 주세요." });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await auth.signupLocal({
        username,
        password,
        displayName: displayName.trim(),
        acceptedTerms: true,
      });
      // viewer 정보가 있으면 별도 PATCH (signup payload에는 viewer 안 받음)
      if (viewer.platform || viewer.nickname?.trim()) {
        try {
          await auth.updateMe({
            viewerPlatform: viewer.platform || null,
            viewerNickname: viewer.nickname?.trim() || null,
          });
        } catch (e2) {
          // viewer 저장 실패해도 가입 자체는 완료
          if (typeof console !== "undefined") console.warn("viewer save failed:", e2);
        }
      }
      router.push("/profile/verify?welcome=1");
      router.refresh();
    } catch (err) {
      setError({ message: err instanceof ApiError ? err.message : err?.message || "가입 실패" });
      setSubmitting(false);
    }
  }

  const uHint = hintLabel(u);
  const dHint = hintLabel(d);

  return (
    <PageShell activePath="/signup">
      <div className="page-head">
        <div>
          <h1>허락방 가입</h1>
          <p>아이디 · 비밀번호 · 닉네임 + 시청 플랫폼(선택). 던파 모험단 인증은 가입 후 진행.</p>
        </div>
        <StickerBadge tone="lime" rotate="r">간단 가입</StickerBadge>
      </div>

      <form className="form-block" onSubmit={handleSubmit} aria-label="가입 폼" noValidate>
        <div className="form-step">기본 정보</div>

        <div className="form-row">
          <label htmlFor="signup-username">아이디</label>
          <input
            id="signup-username"
            className="form-input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="영문/숫자/언더스코어 3~32자"
            required
          />
          {uHint ? (
            <small className={`avail-hint avail-hint--${uHint.tone}`}>{uHint.text}</small>
          ) : null}
        </div>

        <div className="form-row">
          <label htmlFor="signup-nick">닉네임</label>
          <input
            id="signup-nick"
            className="form-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="허락방에서 쓸 이름"
            required
          />
          {dHint ? (
            <small className={`avail-hint avail-hint--${dHint.tone}`}>{dHint.text}</small>
          ) : null}
        </div>

        <div className="form-row">
          <label htmlFor="signup-pw">비밀번호</label>
          <input
            id="signup-pw"
            className="form-input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="4자 이상"
            required
          />
          <small>최소 4자. 학생/시청자 친화 정책.</small>
        </div>

        <div className="form-row">
          <label htmlFor="signup-pw2">비밀번호 확인</label>
          <input
            id="signup-pw2"
            className="form-input"
            type="password"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          {passwordMatch === "ok" ? (
            <small className="avail-hint avail-hint--ok">✓ 일치합니다</small>
          ) : passwordMatch === "mismatch" ? (
            <small className="avail-hint avail-hint--bad">✗ 비밀번호가 다릅니다</small>
          ) : null}
        </div>

        <ViewerPlatformField value={viewer} onChange={setViewer} idPrefix="signup-viewer" />

        <div className="form-row">
          <label
            htmlFor="signup-terms"
            style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", lineHeight: 1.5 }}
          >
            <input
              id="signup-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span>
              <strong>(필수)</strong>{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderBottom: "2px solid var(--primary)", color: "var(--primary-ink)", fontWeight: 800 }}
              >
                이용약관
              </Link>{" "}
              ·{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderBottom: "2px solid var(--primary)", color: "var(--primary-ink)", fontWeight: 800 }}
              >
                개인정보처리방침
              </Link>
              에 동의합니다
            </span>
          </label>
        </div>

        {error ? (
          <div className="callout-box is-pending">
            <strong>확인 필요</strong>
            {error.message}
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!canSubmit || submitting}
        >
          {submitting ? "가입 처리중…" : "가입 완료"}
        </button>

        <p style={{ marginTop: 12, fontSize: "0.86rem", color: "var(--ink-muted, #888)" }}>
          가입 후 모험단 인증 페이지로 안내됩니다. 인증은 선택이며 언제든 진행 가능.
        </p>
      </form>

      <div style={{ marginTop: 18, fontSize: "0.86rem" }}>
        이미 계정이 있다면{" "}
        <Link
          href="/login"
          style={{
            borderBottom: "2px solid var(--primary)",
            color: "var(--primary-ink)",
            fontWeight: 800,
          }}
        >
          로그인
        </Link>
      </div>
    </PageShell>
  );
}
