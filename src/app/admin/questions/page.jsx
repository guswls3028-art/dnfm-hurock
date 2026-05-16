"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { broadcast } from "@/lib/api-client";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

const STATUSES = [
  { value: "", label: "전체", tone: "ink" },
  { value: "received", label: "접수", tone: "cyan" },
  { value: "shortlisted", label: "후보", tone: "amber" },
  { value: "on_air", label: "방송중", tone: "pink" },
  { value: "answered", label: "완료", tone: "lime" },
  { value: "hidden", label: "숨김", tone: "ink" },
  { value: "rejected", label: "반려", tone: "ink" },
];

const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));
const STATUS_TONE = Object.fromEntries(STATUSES.map((s) => [s.value, s.tone]));

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function AdminQuestionsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await broadcast.questions.list({ status: status || undefined, pageSize: 80 });
      setItems(data?.items || []);
    } catch (err) {
      setError(err?.message || "질문 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (userLoading || !user || !isAdmin(user)) return;
    load();
  }, [load, user, userLoading]);

  async function updateQuestion(id, nextStatus) {
    let moderationReason;
    if (nextStatus === "hidden" || nextStatus === "rejected") {
      moderationReason = window.prompt("숨김/반려 사유를 입력해 주세요.");
      if (!moderationReason) return;
    }
    try {
      await broadcast.questions.update(id, { status: nextStatus, moderationReason });
      await load();
    } catch (err) {
      alert(err?.message || "상태 변경에 실패했습니다.");
    }
  }

  if (userLoading) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>권한 확인 중…</h1>
            <p>운영자 권한을 확인하고 있습니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">확인중</StickerBadge>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>질문 큐는 운영자 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link href={`/login?returnTo=${encodeURIComponent("/admin/questions")}`} className="btn btn-primary">
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  if (user && !isAdmin(user)) {
    return (
      <PageShell activePath="/admin">
        <div className="page-head">
          <div>
            <h1>접근 권한이 없습니다</h1>
            <p>허락 운영자 계정으로만 접근할 수 있습니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">403</StickerBadge>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activePath="/admin">
      <div className="page-head">
        <div>
          <h1>
            방송 질문 큐 <StickerBadge tone="cyan" rotate="r">Q&A</StickerBadge>
          </h1>
          <p>접수된 질문을 방송 후보로 올리고, 현재 질문은 OBS 화면에 바로 표시합니다.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/broadcast/questions/live" className="btn btn-primary" target="_blank">OBS 화면</Link>
          <Link href="/questions" className="btn btn-ghost" target="_blank">질문 접수</Link>
        </div>
      </div>

      <section className="section" aria-labelledby="question-filter">
        <div className="section-head">
          <h2 id="question-filter">상태 필터</h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button
              key={s.value || "all"}
              type="button"
              className={`btn btn-sm${status === s.value ? " btn-primary" : " btn-ghost"}`}
              onClick={() => setStatus(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="callout-box is-pending">
          <strong>불러오기 실패</strong>
          {error}
        </div>
      ) : null}

      <section className="section" aria-labelledby="question-list">
        <div className="section-head">
          <h2 id="question-list">질문 목록</h2>
          <button type="button" className="btn btn-sm btn-ghost" onClick={load}>새로고침</button>
        </div>
        <div className="grid grid-2">
          {items.map((q) => (
            <article key={q.id} className="card card-tone-cyan">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <StickerBadge tone={STATUS_TONE[q.status] || "ink"} rotate="0">
                  {STATUS_LABEL[q.status] || q.status}
                </StickerBadge>
                <small style={{ color: "var(--muted)", fontWeight: 800 }}>{formatDate(q.createdAt)}</small>
              </div>
              <h3 style={{ marginTop: 10 }}>{q.content}</h3>
              <p style={{ marginBottom: 12 }}>
                {q.nickname || "익명"} · {q.category || "general"}
              </p>
              {q.moderationReason ? (
                <p style={{ color: "var(--muted)", fontSize: "0.84rem" }}>사유: {q.moderationReason}</p>
              ) : null}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-sm" onClick={() => updateQuestion(q.id, "shortlisted")}>
                  후보
                </button>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => updateQuestion(q.id, "on_air")}>
                  방송 표시
                </button>
                <button type="button" className="btn btn-sm btn-cyan" onClick={() => updateQuestion(q.id, "answered")}>
                  완료
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => updateQuestion(q.id, "hidden")}>
                  숨김
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => updateQuestion(q.id, "rejected")}>
                  반려
                </button>
              </div>
            </article>
          ))}
        </div>
        {!loading && items.length === 0 ? (
          <div className="callout-box">
            <strong>질문 없음</strong>
            현재 조건에 맞는 질문이 없습니다.
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
