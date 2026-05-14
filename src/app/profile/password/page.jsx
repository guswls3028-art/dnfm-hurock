"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<PageShell activePath="/profile/password"><div className="page-head"><h1>불러오는 중…</h1></div></PageShell>}>
      <ChangePasswordInner />
    </Suspense>
  );
}

function ChangePasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const required = params.get("required") === "1";
  const { user, loading } = useCurrentUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?returnTo=${encodeURIComponent("/profile/password")}`);
    }
  }, [loading, user, router]);

  const match = useMemo(() => {
    if (!newPassword || !newPassword2) return null;
    return newPassword === newPassword2 ? "ok" : "mismatch";
  }, [newPassword, newPassword2]);

  const canSubmit = useMemo(() => {
    if (!currentPassword || !newPassword || !newPassword2) return false;
    if (newPassword.length < 4) return false;
    if (newPassword !== newPassword2) return false;
    if (newPassword === currentPassword) return false;
    return true;
  }, [currentPassword, newPassword, newPassword2]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await auth.changePassword({ currentPassword, newPassword });
      setDone(true);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err?.message || "비밀번호 변경 실패";
      setError({ message: msg });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell activePath="/profile/password">
        <div className="page-head">
          <h1>불러오는 중…</h1>
        </div>
      </PageShell>
    );
  }

  if (done) {
    return (
      <PageShell activePath="/profile/password">
        <div className="page-head">
          <div>
            <h1>비밀번호 변경 완료</h1>
            <p>보안을 위해 다른 디바이스에서도 다시 로그인해야 합니다.</p>
          </div>
          <StickerBadge tone="lime" rotate="r">완료</StickerBadge>
        </div>
        <div className="form-block">
          <p>새 비밀번호로 다시 로그인해 주세요.</p>
          <Link href="/login" className="btn btn-primary">
            로그인 페이지로
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/profile/password">
      <div className="page-head">
        <div>
          <h1>{required ? "새 비밀번호 설정 (필수)" : "비밀번호 변경"}</h1>
          <p>
            {required
              ? "운영자가 임시 비밀번호를 발급했습니다. 새 비밀번호를 설정해 주세요."
              : "변경 즉시 모든 디바이스에서 자동 로그아웃됩니다."}
          </p>
        </div>
        <StickerBadge tone={required ? "pink" : "amber"} rotate="r">
          {required ? "필수" : "보안"}
        </StickerBadge>
      </div>

      {required ? (
        <div className="callout-box is-pending" style={{ marginBottom: 12 }}>
          <strong>임시 비밀번호로 로그인됨</strong>
          새 비밀번호를 설정하기 전에는 다른 페이지로 이동할 수 없습니다.
        </div>
      ) : null}

      <form className="form-block" onSubmit={handleSubmit} aria-label="비밀번호 변경 폼" noValidate>
        <div className="form-step">현재 비밀번호 확인</div>
        <div className="form-row">
          <label htmlFor="pw-current">현재 비밀번호</label>
          <input
            id="pw-current"
            className="form-input"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-step">새 비밀번호</div>
        <div className="form-row">
          <label htmlFor="pw-new">새 비밀번호</label>
          <input
            id="pw-new"
            className="form-input"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="4자 이상"
            required
          />
          <small>최소 4자. 현재 비밀번호와 다른 값으로.</small>
          {newPassword && newPassword.length < 4 ? (
            <small className="avail-hint avail-hint--bad">4자 이상 입력해 주세요</small>
          ) : newPassword && newPassword === currentPassword ? (
            <small className="avail-hint avail-hint--bad">현재 비밀번호와 같습니다</small>
          ) : newPassword && newPassword.length >= 4 ? (
            <small className="avail-hint avail-hint--ok">✓ 길이 충족</small>
          ) : null}
        </div>

        <div className="form-row">
          <label htmlFor="pw-new2">새 비밀번호 확인</label>
          <input
            id="pw-new2"
            className="form-input"
            type="password"
            autoComplete="new-password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            required
          />
          {match === "ok" ? (
            <small className="avail-hint avail-hint--ok">✓ 일치합니다</small>
          ) : match === "mismatch" ? (
            <small className="avail-hint avail-hint--bad">✗ 비밀번호가 다릅니다</small>
          ) : null}
        </div>

        {error ? (
          <div className="callout-box is-pending">
            <strong>변경 실패</strong>
            {error.message}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || submitting}>
            {submitting ? "변경 중…" : required ? "새 비밀번호 설정" : "비밀번호 변경"}
          </button>
          {required ? null : (
            <Link href="/profile" className="btn btn-ghost">
              취소
            </Link>
          )}
        </div>
      </form>
    </PageShell>
  );
}
