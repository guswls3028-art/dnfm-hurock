"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { reports as reportsApi, ApiError } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

/**
 * 신고함 (운영자 전용).
 *
 * 동작:
 *  - GET /sites/hurock/reports?status=...    → 신고 목록
 *  - PATCH /sites/hurock/reports/:id         → status / resolution / 메모 저장
 *  - 대상 글/댓글 빠른 이동 링크
 *
 * 상태 enum: pending / in_review / resolved / dismissed
 * 처리 옵션 (resolution): hidden / deleted / warned_user / ip_banned / dismissed / other
 */

const STATUS_TABS = [
  { value: "pending", label: "접수" },
  { value: "in_review", label: "검토중" },
  { value: "resolved", label: "처리완료" },
  { value: "dismissed", label: "기각" },
];

const REASON_LABEL = {
  spam: "도배/광고",
  abuse: "욕설/비방",
  porn: "음란물",
  hate: "혐오",
  privacy: "개인정보",
  copyright: "저작권",
  advertise: "외부 거래/광고",
  malicious_link: "악성 링크",
  other: "기타",
};

const RESOLUTIONS = [
  { value: "", label: "조치 미선택" },
  { value: "hidden", label: "글 숨김" },
  { value: "deleted", label: "글 삭제" },
  { value: "comment_hidden", label: "댓글 숨김" },
  { value: "comment_deleted", label: "댓글 삭제" },
  { value: "warned_user", label: "유저 경고" },
  { value: "ip_banned", label: "IP 차단" },
  { value: "dismissed_invalid", label: "기각 — 정당한 글" },
  { value: "other", label: "기타" },
];

function formatTime(iso) {
  if (!iso) return "";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  return t.toLocaleString("ko-KR", { hour12: false });
}

export default function AdminReportsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const userIsAdmin = isAdmin(user, "hurock");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await reportsApi.list({ status: statusFilter, pageSize: 100 });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "목록 불러오기 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!userLoading && user && userIsAdmin) {
      reload();
    }
  }, [userLoading, user, userIsAdmin, reload]);

  async function applyAction(row, next) {
    if (busyId) return;
    setBusyId(row.id);
    try {
      await reportsApi.update(row.id, {
        status: next.status,
        resolution: next.resolution || undefined,
        resolutionNote: next.resolutionNote?.trim() || undefined,
        moderatorMemo: next.moderatorMemo?.trim() || undefined,
      });
      await reload();
    } catch (e) {
      window.alert(e instanceof ApiError ? e.message : "처리 실패");
    } finally {
      setBusyId(null);
    }
  }

  if (!userLoading && !user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>신고함은 운영자 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/admin/reports")}`}
          className="btn btn-primary"
        >
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  if (!userLoading && user && !userIsAdmin) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>접근 권한이 없습니다</h1>
            <p>운영자 권한이 필요해요.</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <Link
            href="/admin"
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800,
            }}
          >
            ← 어드민
          </Link>
          <h1>
            신고함 <StickerBadge tone="pink" rotate="r">🚩 운영</StickerBadge>
          </h1>
          <p>접수된 신고를 검토하고 조치를 기록하세요.</p>
        </div>
      </div>

      <div className="tabs" role="tablist" style={{ marginTop: 12 }}>
        {STATUS_TABS.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`tab${statusFilter === s.value ? " is-active" : ""}`}
            onClick={() => setStatusFilter(s.value)}
            aria-selected={statusFilter === s.value}
          >
            {s.label}
          </button>
        ))}
      </div>

      {err ? (
        <div className="callout-box is-pending" style={{ marginTop: 12 }}>
          <strong>불러오기 실패</strong>
          {err}
        </div>
      ) : null}

      <div className="grid" style={{ gap: 12, marginTop: 12 }}>
        {loading ? (
          <article className="card" style={{ padding: 14 }}>
            <p>불러오는 중…</p>
          </article>
        ) : rows.length === 0 ? (
          <article className="card" style={{ padding: 14 }}>
            <p>해당 상태의 신고가 없어요.</p>
          </article>
        ) : (
          rows.map((r) => (
            <ReportRow
              key={r.id}
              row={r}
              busy={busyId === r.id}
              onApply={(next) => applyAction(r, next)}
            />
          ))
        )}
      </div>
    </PageShell>
  );
}

function ReportRow({ row, busy, onApply }) {
  const [resolution, setResolution] = useState(row.resolution || "");
  const [resolutionNote, setResolutionNote] = useState(row.resolutionNote || "");
  const [moderatorMemo, setModeratorMemo] = useState(row.moderatorMemo || "");

  const targetLink =
    row.targetType === "post"
      ? `/board/${row.targetId}`
      : null; // 댓글은 직접 anchor 없으니 부모 글 페이지 링크는 추후

  return (
    <article
      className="card"
      style={{
        padding: 14,
        display: "grid",
        gap: 8,
        border: "2px solid var(--ink)",
      }}
    >
      <header
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <StickerBadge tone="pink" rotate="l">
          {row.targetType === "post" ? "글" : "댓글"}
        </StickerBadge>
        <StickerBadge tone="yellow" rotate="r">
          {REASON_LABEL[row.reason] || row.reason}
        </StickerBadge>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          {formatTime(row.createdAt)}
        </span>
        <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--muted)" }}>
          상태: <strong>{row.status}</strong>
        </span>
      </header>

      {row.detail ? (
        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          <strong>신고 상세:</strong> {row.detail}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: "0.85rem" }}>
        <span>
          <strong>대상 ID</strong>: <code>{row.targetId}</code>
        </span>
        {targetLink ? (
          <Link href={targetLink} target="_blank" className="btn btn-xs">
            글 보러가기 ↗
          </Link>
        ) : null}
        <span>
          <strong>신고자</strong>: {row.reporterId ? `회원 ${row.reporterId.slice(0, 8)}…` : "비회원"}
        </span>
      </div>

      <div className="form-divider" />

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>조치 (resolution)</span>
          <select
            className="form-select"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          >
            {RESOLUTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>조치 사유 (공식 기록)</span>
          <textarea
            className="form-textarea"
            rows={2}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="처리 결과 사유 — 분쟁 시 공개 가능"
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
            운영 메모 (비공개)
          </span>
          <textarea
            className="form-textarea"
            rows={2}
            value={moderatorMemo}
            onChange={(e) => setModeratorMemo(e.target.value)}
            placeholder="운영자만 봄. 사용자에게 공개되지 않음."
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-sm"
          disabled={busy}
          onClick={() =>
            onApply({ status: "in_review", resolution, resolutionNote, moderatorMemo })
          }
        >
          🔍 검토중
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={busy}
          onClick={() =>
            onApply({ status: "resolved", resolution, resolutionNote, moderatorMemo })
          }
        >
          ✅ 처리완료
        </button>
        <button
          type="button"
          className="btn btn-sm"
          disabled={busy}
          onClick={() =>
            onApply({ status: "dismissed", resolution, resolutionNote, moderatorMemo })
          }
        >
          ✖ 기각
        </button>
      </div>
    </article>
  );
}
