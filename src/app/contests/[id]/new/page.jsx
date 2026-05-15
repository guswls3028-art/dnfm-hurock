"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import ContestForm from "@/components/ContestForm";
import StickerBadge from "@/components/StickerBadge";
import { contests as contestsApi } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

export default function ContestNewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [contest, setContest] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const detail = await contestsApi.detail(id);
        if (!alive) return;
        if (detail) setContest(detail.contest || detail);
      } catch (err) {
        if (!alive) return;
        setFetchError(err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (fetchError) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <div>
            <Link
              href="/contests"
              style={{ display: "inline-block", marginBottom: 8, borderBottom: "2px solid var(--ink)", fontSize: "0.84rem", fontWeight: 800 }}
            >
              ← 콘테스트 목록
            </Link>
            <h1>콘테스트를 못 찾았어요</h1>
            <p>지금은 진행 중인 콘테스트가 없거나, 이미 마감/종료됐을 수 있어요. ({fetchError.message || "요청 실패"})</p>
          </div>
          <StickerBadge tone="amber" rotate="r">404</StickerBadge>
        </div>
      </PageShell>
    );
  }

  if (!contest) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <h1>로딩 중…</h1>
        </div>
      </PageShell>
    );
  }

  // contest.status 가드 — 마감/심사/투표/종료 단계는 새 참가 불가. backend 도 거부하지만 UX 측면.
  const acceptingEntries = contest.status === "open";
  if (!acceptingEntries) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <div>
            <Link
              href={`/contests/${contest.id}`}
              style={{
                display: "inline-block",
                marginBottom: 8,
                borderBottom: "2px solid var(--ink)",
                fontSize: "0.84rem",
                fontWeight: 800,
              }}
            >
              ← {contest.title}
            </Link>
            <h1>지금은 참가 모집 단계가 아니에요</h1>
            <p>현재 상태: {contest.statusLabel || contest.status}. 결과 발표 / 투표는 콘테스트 페이지에서 확인하세요.</p>
          </div>
          <StickerBadge tone="amber" rotate="r">
            {contest.statusLabel || "마감"}
          </StickerBadge>
        </div>
      </PageShell>
    );
  }

  // 비회원 정책 SSOT (project_anonymous_posting_policy 2026-05-14):
  // 콘테스트 참가 = 비회원 가능. 회원이면 dnfProfile 자동 채움 편의.
  // userLoading 동안엔 isGuest 결정 보류 — form 깜빡임 방지.
  const isGuest = !userLoading && !user;
  // backend formSchema = { fields: [...] }.
  const schema = Array.isArray(contest.formSchema)
    ? contest.formSchema
    : Array.isArray(contest.formSchema?.fields)
    ? contest.formSchema.fields
    : [];

  return (
    <PageShell activePath="/contests">
      <div className="page-head">
        <div>
          <Link
            href={`/contests/${contest.id}`}
            style={{
              display: "inline-block",
              marginBottom: 8,
              borderBottom: "2px solid var(--ink)",
              fontSize: "0.84rem",
              fontWeight: 800,
            }}
          >
            ← {contest.title}
          </Link>
          <h1>참가 양식</h1>
          <p>
            마감: {contest.submissionCloses || "-"}. 마감 전까진 한 번 더 다듬어도 OK.
          </p>
        </div>
        <StickerBadge tone="pink" rotate="r">
          참가 모집중
        </StickerBadge>
      </div>

      {schema.length === 0 ? (
        <div className="callout-box">
          이 콘테스트는 따로 참가 양식이 없습니다 (스크린샷 업로드만 받는 형식).
        </div>
      ) : userLoading ? (
        // user 결정 전 form 깜빡임 방지 — skeleton
        <div className="form-block" aria-busy="true">
          <div className="form-step">참가 양식 로딩 중…</div>
          <div style={{ minHeight: 320 }} />
        </div>
      ) : (
        <div className="grid grid-2">
          <ContestForm
            contestId={contest.id}
            schema={schema}
            dnfProfile={user?.dnfProfile}
            isGuest={isGuest}
          />
          <div className="form-block">
            <div className="form-step">참가 안내</div>
            <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              <li>참가 부문을 하나 골라주세요.</li>
              <li>코디 사진은 1장. 식별 가능한 화질이면 충분.</li>
              <li>제출 후 운영자 검수에서 승인된 참가작만 공개/투표 후보로 올라갑니다.</li>
              <li>
                <strong>회원</strong>이면 모험단명/캐릭터명을 던파 프로필에서 자동 채워줘요.
              </li>
              <li>
                <strong>비회원</strong>도 참가 가능. 닉/비번은 비워도 됩니다 (수정/삭제는 비번 필요).
              </li>
            </ul>
            {isGuest ? (
              <div className="callout-box">
                <strong>비회원으로 참가 중</strong>
                자동 채움은 없어요. 모든 필드를 직접 입력. 회원으로 참가하려면{" "}
                <Link
                  href={`/login?returnTo=${encodeURIComponent(`/contests/${contest.id}/new`)}`}
                  style={{
                    borderBottom: "2px solid var(--primary)",
                    color: "var(--primary-ink)",
                    fontWeight: 800,
                  }}
                >
                  로그인 / 가입
                </Link>.
              </div>
            ) : (
              <div className="callout-box">
                <strong>로그인 계정</strong>
                {user?.displayName || user?.username} · 모험단: {user?.dnfProfile?.adventureName || "(미등록)"}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
