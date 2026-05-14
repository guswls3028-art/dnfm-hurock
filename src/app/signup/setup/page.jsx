"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import ViewerPlatformField from "@/components/ViewerPlatformField";
import { apiFetch, ApiError, auth } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

function validateDisplayName(v) {
  const t = v.trim();
  if (t.length < 1) return "닉네임을 입력해 주세요";
  if (t.length > 32) return "32자 이하";
  return null;
}

function useAvailability(value) {
  const [state, setState] = useState({ status: "idle" });
  const timer = useRef(null);
  const reqId = useRef(0);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value) {
      setState({ status: "idle" });
      return;
    }
    const err = validateDisplayName(value);
    if (err) {
      setState({ status: "invalid", message: err });
      return;
    }
    setState({ status: "checking" });
    const me = ++reqId.current;
    timer.current = setTimeout(async () => {
      try {
        const data = await apiFetch(
          `/auth/check-availability?displayName=${encodeURIComponent(value)}`,
        );
        if (reqId.current !== me) return;
        setState({ status: data?.available === true ? "ok" : "taken" });
      } catch (err) {
        if (reqId.current !== me) return;
        setState({ status: "error", message: err?.message || "확인 실패" });
      }
    }, 500);
    return () => timer.current && clearTimeout(timer.current);
  }, [value]);
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

export default function SetupPage() {
  return (
    <Suspense fallback={<PageShell activePath="/signup/setup"><p>불러오는 중…</p></PageShell>}>
      <SetupInner />
    </Suspense>
  );
}

function SetupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, refresh } = useCurrentUser();

  const suggested = params.get("suggested") || "";
  const [displayName, setDisplayName] = useState(suggested);
  const [viewer, setViewer] = useState({ platform: null, nickname: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user?.displayName && !suggested) {
      // OAuth callback 이 placeholder displayName 박아둠 (예: google_a1b2c3d4).
      // 사용자가 그대로 두지 않게 빈 칸으로 시작. suggested 가 있으면 그 값 prefil.
      if (/^(google|kakao)_/.test(user.displayName)) {
        setDisplayName("");
      } else {
        setDisplayName(user.displayName);
      }
    }
  }, [loading, user, router, suggested]);

  const state = useAvailability(displayName.trim());
  const msg = hintLabel(state);
  const canSubmit = state.status === "ok" && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await auth.updateMe({
        displayName: displayName.trim(),
        viewerPlatform: viewer.platform || null,
        viewerNickname: viewer.nickname?.trim() || null,
      });
      await refresh();
      router.push("/profile/verify?welcome=1");
      router.refresh();
    } catch (err) {
      const m = err instanceof ApiError ? err.message : err?.message || "저장 실패";
      setError(m);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell activePath="/signup/setup">
        <p>불러오는 중…</p>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/signup/setup">
      <div className="page-head">
        <div>
          <h1>환영합니다 — 닉네임 정하기</h1>
          <p>소셜 로그인으로 가입하셨습니다. 허락방에서 보일 닉네임을 정해주세요.</p>
        </div>
        <StickerBadge tone="lime" rotate="r">소셜 가입</StickerBadge>
      </div>

      <form className="form-block" onSubmit={handleSubmit} aria-label="setup 폼" noValidate>
        <div className="form-step">기본 정보</div>
        <div className="form-row">
          <label htmlFor="setup-nick">닉네임</label>
          <input
            id="setup-nick"
            className="form-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="예: 허락팬123"
            maxLength={32}
            autoFocus
          />
          {msg ? (
            <small className={`avail-hint avail-hint--${msg.tone}`}>{msg.text}</small>
          ) : null}
        </div>

        <ViewerPlatformField value={viewer} onChange={setViewer} idPrefix="setup-viewer" />

        {error ? (
          <div className="callout-box is-pending">
            <strong>저장 실패</strong>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {submitting ? "저장 중…" : "닉네임 저장하고 다음 →"}
          </button>
          <Link href="/profile/verify?welcome=1" className="btn btn-ghost">
            건너뛰기
          </Link>
        </div>

        <p style={{ marginTop: 12, fontSize: "0.86rem", color: "var(--ink-muted, #888)" }}>
          저장 후 모험단 인증 페이지로 이동합니다. 인증은 선택이며 언제든 진행 가능.
        </p>
      </form>
    </PageShell>
  );
}
