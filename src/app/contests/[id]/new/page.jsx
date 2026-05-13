"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import ContestForm from "@/components/ContestForm";
import StickerBadge from "@/components/StickerBadge";
import { contests as mockContests } from "@/lib/content";
import { contests as contestsApi } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

export default function ContestNewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [contest, setContest] = useState(() => mockContests.find((c) => c.id === id) || null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const detail = await contestsApi.detail(id);
        if (!alive) return;
        if (detail) setContest(detail.contest || detail);
      } catch {
        /* mock 유지 */
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!contest) {
    return (
      <PageShell activePath="/contests">
        <div className="page-head">
          <h1>로딩 중…</h1>
        </div>
      </PageShell>
    );
  }

  // 로그인 안 했으면 로그인 안내
  if (!userLoading && !user) {
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
            <h1>참가하려면 로그인이 필요해요</h1>
            <p>모험단명/캐릭터명을 자동으로 채우려면 던파 프로필이 등록된 계정이 필요합니다.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">
            로그인 필요
          </StickerBadge>
        </div>
        <div className="form-block" style={{ gap: 12 }}>
          <Link
            href={`/login?returnTo=${encodeURIComponent(`/contests/${contest.id}/new`)}`}
            className="btn btn-primary"
          >
            로그인 / 가입
          </Link>
          <Link href={`/contests/${contest.id}`} className="btn">
            돌아가기
          </Link>
        </div>
      </PageShell>
    );
  }

  const schema = Array.isArray(contest.formSchema) ? contest.formSchema : [];

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
      ) : (
        <div className="grid grid-2">
          <ContestForm
            contestId={contest.id}
            schema={schema}
            dnfProfile={user?.dnfProfile}
          />
          <div className="form-block">
            <div className="form-step">참가 안내</div>
            <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              <li>모험단명/캐릭터명은 내 페이지의 던파 프로필에서 자동 채워집니다.</li>
              <li>참가 부문을 하나 골라주세요 (남자 애니 / 여자 애니 / 웃긴 / 나만의 멋진).</li>
              <li>코디 사진은 1장. 식별 가능한 화질이면 충분.</li>
              <li>제출 후에도 마감 전까진 수정 가능.</li>
              <li>마감 후 후보 전원이 시청자 투표에 올라가고, 허락이 방송 중 뽑기로 추가 1팀을 더 골라요.</li>
            </ul>
            <div className="callout-box">
              <strong>로그인 계정</strong>
              {user?.displayName || user?.username} · 모험단: {user?.dnfProfile?.adventureName || "(미등록)"}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
