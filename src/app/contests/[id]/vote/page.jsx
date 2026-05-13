"use client";

import Link from "next/link";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import VoteCard from "@/components/VoteCard";
import StickerBadge from "@/components/StickerBadge";
import { contestEntries, contests } from "@/lib/content";

export default function ContestVotePage({ params }) {
  const { id } = use(params);
  const contest = contests.find((c) => c.id === id);
  if (!contest) notFound();

  const entries = contestEntries[contest.id] || [];
  const [selected, setSelected] = useState(null);
  const disabled = contest.status !== "voting";

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <Link
            href={`/contests/${contest.id}`}
            style={{ display: "inline-block", marginBottom: 8, borderBottom: "2px solid var(--ink)", fontSize: "0.84rem", fontWeight: 800 }}
          >
            ← {contest.title}
          </Link>
          <h1>투표하기</h1>
          <p>1인 1표. 마감 후 결과 페이지가 켜집니다.</p>
        </div>
        <StickerBadge tone={disabled ? "ink" : "cyan"} rotate="r">
          {disabled ? "투표 비활성" : "투표중"}
        </StickerBadge>
      </div>

      {disabled && (
        <div className="callout-box is-pending">
          <strong>아직/이미 투표 단계가 아닙니다</strong>
          {contest.title} 의 현재 상태는 <code>{contest.statusLabel}</code> 입니다.
        </div>
      )}

      {entries.length === 0 ? (
        <div className="callout-box">투표할 참가작이 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-3">
            {entries.map((entry) => (
              <VoteCard
                key={entry.id}
                entry={entry}
                groupName={`vote-${contest.id}`}
                selected={selected === entry.id}
                onSelect={setSelected}
                disabled={disabled}
              />
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" className="btn btn-primary is-disabled" disabled title="백엔드 연결 전 — 준비중">
              투표 제출 <span className="btn-note">(준비중)</span>
            </button>
            <span style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
              {selected ? `선택: ${entries.find((e) => e.id === selected)?.title || ""}` : "아직 선택 안 함"}
            </span>
          </div>
        </>
      )}
    </PageShell>
  );
}
