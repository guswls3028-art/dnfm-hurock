"use client";

import Link from "next/link";
import { useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth } from "@/lib/api-client";
import { isAdmin, isSuperAdmin, useCurrentUser } from "@/lib/use-current-user";

/**
 * 회원 관리 — 현재 가능한 운영:
 *   - super 권한: 자체 가입자 비밀번호 reset (사용자 lockout 시 복구)
 *
 * 다음 단계 (백엔드):
 *   - GET /sites/hurock/members — 회원 목록 + 검색
 *   - PATCH /sites/hurock/members/:id/role — 권한 부여/회수
 *   - POST /sites/hurock/members/:id/ban — 차단
 */
export default function AdminMembersPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const isSuper = isSuperAdmin(user);

  const [resetUsername, setResetUsername] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [resetError, setResetError] = useState(null);

  async function handleReset(e) {
    e.preventDefault();
    if (resetting || !resetUsername.trim()) return;
    setResetError(null);
    setResetResult(null);
    setResetting(true);
    try {
      const data = await auth.adminResetPassword({ username: resetUsername.trim() });
      setResetResult(data);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : err?.message || "reset 실패");
    } finally {
      setResetting(false);
    }
  }

  function handleCopyTemp() {
    if (!resetResult?.tempPassword) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resetResult.tempPassword).catch(() => {});
    }
  }

  if (!userLoading && !user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>회원 관리는 운영자 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/admin/members")}`}
          className="btn btn-primary"
        >
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  if (!userLoading && user && !isAdmin(user)) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>접근 권한이 없습니다</h1>
            <p>운영자 전용 페이지.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">403</StickerBadge>
        </div>
        <Link href="/" className="btn">홈으로</Link>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <h1>
            회원 관리 <StickerBadge tone="amber" rotate="r">백엔드 작업중</StickerBadge>
          </h1>
          <p>회원 목록 / 권한 변경 / 차단 — 백엔드 endpoint 작업 후 활성화.</p>
        </div>
        <Link href="/admin" className="btn btn-sm">← 어드민 홈</Link>
      </div>

      <section className="section">
        <div className="callout-box">
          <strong>지금 가능한 운영</strong>
          <ul style={{ margin: "8px 0 0 18px" }}>
            <li>특정 글/댓글이 부적절하면 <Link href="/admin/board">게시판 관리</Link> 에서 즉시 삭제</li>
            <li>콘테스트 참가자 심사 / 후보 선정 / 결과 발표는 <Link href="/admin">콘테스트 관리</Link></li>
            <li>회원 차단은 현재 백엔드 API 가 없어 임시로 카톡 톡방장에게 문의</li>
          </ul>
        </div>

        {isSuper ? (
          <article className="form-block" style={{ marginTop: 14 }}>
            <h2 style={{ marginTop: 0 }}>비밀번호 reset (super)</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              사용자가 비밀번호를 잊었을 때 임시 비번을 발급. 발급 즉시 해당 사용자의 모든 세션이 로그아웃되며,
              사용자는 임시 비번으로 로그인 후 <strong>강제로 새 비밀번호를 설정</strong>해야 합니다.
              임시 비번은 OOB(카톡/DM) 로 안전하게 전달하세요.
            </p>

            <form onSubmit={handleReset} aria-label="비밀번호 reset 폼" style={{ display: "grid", gap: 12 }}>
              <div className="form-row">
                <label htmlFor="reset-username">대상 아이디 (username)</label>
                <input
                  id="reset-username"
                  className="form-input"
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="영문/숫자/언더스코어"
                  required
                  disabled={resetting}
                />
              </div>
              {resetError ? (
                <div className="callout-box is-pending">
                  <strong>실패</strong>
                  {resetError}
                </div>
              ) : null}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={resetting || !resetUsername.trim()}
              >
                {resetting ? "reset 중…" : "임시 비번 발급"}
              </button>
            </form>

            {resetResult ? (
              <div className="callout-box" style={{ marginTop: 12 }}>
                <strong>발급 완료 — {resetResult.displayName}</strong>
                <div style={{ marginTop: 8, fontSize: "0.92rem" }}>
                  <div>
                    임시 비밀번호:{" "}
                    <code
                      style={{
                        padding: "2px 8px",
                        background: "rgba(0,0,0,0.08)",
                        borderRadius: 4,
                        userSelect: "all",
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      {resetResult.tempPassword}
                    </code>{" "}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyTemp}>
                      복사
                    </button>
                  </div>
                  <p style={{ marginTop: 8, color: "var(--muted)" }}>
                    이 임시 비번을 사용자에게 안전하게 전달하세요. 사용자는 로그인 직후 강제로 새 비밀번호를 설정합니다.
                  </p>
                </div>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="callout-box is-pending" style={{ marginTop: 14 }}>
            <strong>비밀번호 reset</strong>
            super 권한 전용입니다. (현재 계정은 일반 admin)
          </div>
        )}

        <div className="callout-box is-pending" style={{ marginTop: 14 }}>
          <strong>다음 단계 (백엔드)</strong>
          <ul style={{ margin: "8px 0 0 18px" }}>
            <li>GET <code>/sites/hurock/members</code> — 회원 목록 + 검색</li>
            <li>PATCH <code>/sites/hurock/members/:id/role</code> — 어드민 권한 부여/회수</li>
            <li>POST <code>/sites/hurock/members/:id/ban</code> — 차단</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
