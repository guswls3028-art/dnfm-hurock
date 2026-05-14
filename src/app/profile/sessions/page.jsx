"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

function shortAgent(ua) {
  if (!ua) return "디바이스 정보 없음";
  const v = String(ua);
  if (/iPhone|iPad/i.test(v)) return "iPhone / iPad";
  if (/Android/i.test(v)) return "Android";
  if (/Macintosh/i.test(v)) return "Mac";
  if (/Windows/i.test(v)) return "Windows";
  if (/Linux/i.test(v)) return "Linux";
  return v.slice(0, 60);
}

function browserHint(ua) {
  if (!ua) return null;
  const v = String(ua);
  if (/CriOS|Chrome/i.test(v)) return "Chrome";
  if (/FxiOS|Firefox/i.test(v)) return "Firefox";
  if (/Edg/i.test(v)) return "Edge";
  if (/Safari/i.test(v)) return "Safari";
  return null;
}

function formatDate(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(s).slice(0, 16);
  }
}

export default function SessionsPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await auth.sessions();
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "불러오기 실패");
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?returnTo=${encodeURIComponent("/profile/sessions")}`);
      return;
    }
    if (user) load();
  }, [loading, user, router, load]);

  async function handleRevoke(id, isCurrent) {
    if (busyId) return;
    setBusyId(id);
    try {
      await auth.revokeSession(id);
      if (isCurrent) {
        router.push("/login");
        router.refresh();
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "로그아웃 실패");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevokeOthers() {
    if (revoking) return;
    setRevoking(true);
    try {
      await auth.revokeOtherSessions();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "처리 실패");
    } finally {
      setRevoking(false);
    }
  }

  if (loading) {
    return (
      <PageShell activePath="/profile/sessions">
        <div className="page-head">
          <h1>불러오는 중…</h1>
        </div>
      </PageShell>
    );
  }

  const otherCount = sessions ? sessions.filter((s) => !s.current).length : 0;

  return (
    <PageShell activePath="/profile/sessions">
      <div className="page-head">
        <div>
          <h1>로그인 디바이스</h1>
          <p>지금 내 계정으로 로그인된 디바이스 목록.</p>
        </div>
        <StickerBadge tone="cyan" rotate="r">보안</StickerBadge>
      </div>

      {error ? (
        <div className="callout-box is-pending" style={{ marginBottom: 12 }}>
          <strong>오류</strong>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Link href="/profile" className="btn btn-ghost btn-sm">
          ← 마이페이지
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleRevokeOthers}
          disabled={revoking || otherCount === 0}
          title={otherCount === 0 ? "다른 디바이스 없음" : ""}
        >
          {revoking ? "처리 중…" : `다른 디바이스 모두 로그아웃 (${otherCount})`}
        </button>
      </div>

      <section className="form-block" style={{ display: "grid", gap: 8 }}>
        {sessions === null ? (
          <p>불러오는 중…</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>활성 세션이 없습니다.</p>
        ) : (
          sessions.map((s) => (
            <article
              key={s.id}
              style={{
                display: "flex",
                gap: 12,
                padding: 12,
                border: s.current ? "2px solid var(--primary)" : "1px solid var(--ink-line, #ccc)",
                borderRadius: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                  {shortAgent(s.userAgent)}
                  {browserHint(s.userAgent) ? (
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      · {browserHint(s.userAgent)}
                    </span>
                  ) : null}
                  {s.current ? (
                    <StickerBadge tone="lime" rotate="0">현재</StickerBadge>
                  ) : null}
                </div>
                <div style={{ fontSize: "0.84rem", color: "var(--muted)", marginTop: 4 }}>
                  IP {s.ipAddress || "?"} · 로그인 {formatDate(s.createdAt)} · 만료 {formatDate(s.expiresAt)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleRevoke(s.id, s.current)}
                disabled={busyId === s.id}
              >
                {busyId === s.id
                  ? "처리 중…"
                  : s.current
                  ? "이 디바이스 로그아웃"
                  : "로그아웃"}
              </button>
            </article>
          ))
        )}
      </section>
    </PageShell>
  );
}
