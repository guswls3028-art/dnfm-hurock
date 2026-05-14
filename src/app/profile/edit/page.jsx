"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import ViewerPlatformField from "@/components/ViewerPlatformField";
import { ApiError, apiFetch, auth, uploads } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

function validateDisplayName(v) {
  const t = v.trim();
  if (t.length < 1) return "닉네임을 입력해 주세요";
  if (t.length > 32) return "32자 이하";
  return null;
}

function useAvailability(value, originalValue) {
  // 원래 값과 같으면 idle (검사 X — 본인 닉 그대로 두면 OK)
  const [state, setState] = useState({ status: "idle" });
  const timer = useRef(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value) {
      setState({ status: "idle" });
      return;
    }
    if (value === originalValue) {
      setState({ status: "ok" });
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
  }, [value, originalValue]);
  return state;
}

function avatarPublicUrl(r2Key) {
  if (!r2Key) return null;
  if (/^https?:\/\//i.test(r2Key)) return r2Key;
  return `https://api.dnfm.kr/uploads/r2/${encodeURIComponent(r2Key)}`;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useCurrentUser();

  const [displayName, setDisplayName] = useState("");
  const [viewer, setViewer] = useState({ platform: null, nickname: "" });
  const [avatarR2Key, setAvatarR2Key] = useState(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?returnTo=${encodeURIComponent("/profile/edit")}`);
      return;
    }
    if (user) {
      setDisplayName(user.displayName || "");
      setViewer({
        platform: user.viewerPlatform || null,
        nickname: user.viewerNickname || "",
      });
      setAvatarR2Key(user.avatarR2Key || null);
    }
  }, [loading, user, router]);

  const original = useMemo(
    () => ({
      displayName: user?.displayName || "",
      viewerPlatform: user?.viewerPlatform || null,
      viewerNickname: user?.viewerNickname || "",
      avatarR2Key: user?.avatarR2Key || null,
    }),
    [user],
  );

  const dnState = useAvailability(displayName.trim(), original.displayName);

  const dirty = useMemo(() => {
    if (displayName.trim() !== original.displayName) return true;
    if ((viewer.platform || null) !== original.viewerPlatform) return true;
    if ((viewer.nickname?.trim() || "") !== original.viewerNickname) return true;
    if ((avatarR2Key || null) !== original.avatarR2Key) return true;
    return false;
  }, [displayName, viewer, avatarR2Key, original]);

  const canSubmit =
    dirty &&
    displayName.trim().length > 0 &&
    (dnState.status === "ok" || dnState.status === "idle");

  async function handleAvatarChange(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (avatarBusy) return;
    setError(null);
    if (!f.type?.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (f.size > MAX_AVATAR_BYTES) {
      setError(`아바타는 ${Math.round(MAX_AVATAR_BYTES / 1024 / 1024)}MB 이하만 가능합니다.`);
      return;
    }
    setAvatarBusy(true);
    try {
      const data = await uploads.file({ purpose: "avatar", file: f });
      const key = data?.upload?.r2Key || data?.r2Key;
      if (!key) throw new Error("아바타 업로드 응답이 비어있습니다.");
      setAvatarR2Key(key);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "아바타 업로드 실패");
    } finally {
      setAvatarBusy(false);
    }
  }

  function handleAvatarClear() {
    setAvatarR2Key(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const patch = {};
      if (displayName.trim() !== original.displayName) {
        patch.displayName = displayName.trim();
      }
      if ((viewer.platform || null) !== original.viewerPlatform) {
        patch.viewerPlatform = viewer.platform || null;
      }
      const newViewerNickname = viewer.nickname?.trim() || "";
      if (newViewerNickname !== original.viewerNickname) {
        patch.viewerNickname = newViewerNickname || null;
      }
      if ((avatarR2Key || null) !== original.avatarR2Key) {
        patch.avatarR2Key = avatarR2Key || null;
      }
      await auth.updateMe(patch);
      await refresh();
      setSavedAt(new Date().toLocaleTimeString("ko-KR"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "저장 실패");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell activePath="/profile/edit">
        <div className="page-head">
          <h1>불러오는 중…</h1>
        </div>
      </PageShell>
    );
  }

  const avatarUrl = avatarPublicUrl(avatarR2Key);

  return (
    <PageShell activePath="/profile/edit">
      <div className="page-head">
        <div>
          <h1>프로필 편집</h1>
          <p>닉네임 · 아바타 · 시청 플랫폼.</p>
        </div>
        <StickerBadge tone="cyan" rotate="r">편집</StickerBadge>
      </div>

      <form className="form-block" onSubmit={handleSubmit} aria-label="프로필 편집 폼" noValidate>
        <div className="form-step">아바타</div>
        <div className="form-row" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.06)",
              border: "2px dashed var(--ink-line, #ccc)",
              overflow: "hidden",
              display: "grid",
              placeItems: "center",
              fontSize: 24,
              fontWeight: 800,
              color: "var(--muted)",
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="아바타" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (displayName?.[0] || "·").toUpperCase()
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label className="btn btn-ghost btn-sm" style={{ cursor: avatarBusy ? "default" : "pointer" }}>
              {avatarBusy ? "업로드 중…" : avatarR2Key ? "다른 사진 선택" : "아바타 업로드"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
                disabled={avatarBusy}
              />
            </label>
            {avatarR2Key ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleAvatarClear} disabled={avatarBusy}>
                제거
              </button>
            ) : null}
          </div>
        </div>

        <div className="form-step">기본 정보</div>
        <div className="form-row">
          <label htmlFor="ed-nick">닉네임</label>
          <input
            id="ed-nick"
            className="form-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="허락방에서 쓸 이름"
            required
          />
          {dnState.status === "checking" ? (
            <small className="avail-hint avail-hint--muted">확인 중…</small>
          ) : dnState.status === "ok" && displayName.trim() !== original.displayName ? (
            <small className="avail-hint avail-hint--ok">사용 가능</small>
          ) : dnState.status === "taken" ? (
            <small className="avail-hint avail-hint--bad">이미 사용 중</small>
          ) : dnState.status === "invalid" ? (
            <small className="avail-hint avail-hint--bad">{dnState.message}</small>
          ) : dnState.status === "error" ? (
            <small className="avail-hint avail-hint--bad">{dnState.message}</small>
          ) : null}
        </div>

        <ViewerPlatformField value={viewer} onChange={setViewer} idPrefix="edit-viewer" />

        {error ? (
          <div className="callout-box is-pending">
            <strong>오류</strong>
            {error}
          </div>
        ) : savedAt ? (
          <div className="callout-box">
            <strong>저장 완료</strong>
            {savedAt} 에 저장됨
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || submitting}>
            {submitting ? "저장 중…" : "저장"}
          </button>
          <Link href="/profile" className="btn btn-ghost">
            취소
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
