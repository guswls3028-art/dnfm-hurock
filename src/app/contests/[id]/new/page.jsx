import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import ContestForm from "@/components/ContestForm";
import StickerBadge from "@/components/StickerBadge";
import { contests, profileMock } from "@/lib/content";

export const metadata = { title: "콘테스트 참가" };

export default async function ContestNewPage({ params }) {
  const { id } = await params;
  const contest = contests.find((c) => c.id === id);
  if (!contest) notFound();

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
          <h1>참가 양식</h1>
          <p>마감: {contest.submissionCloses}. 자유롭게 한 번 더 다듬어도 마감 전까진 수정 가능.</p>
        </div>
        <StickerBadge tone="pink" rotate="r">
          참가 모집중
        </StickerBadge>
      </div>

      {contest.formSchema.length === 0 ? (
        <div className="callout-box">이 콘테스트는 따로 참가 양식이 없습니다 (스크린샷 업로드 형식).</div>
      ) : (
        <div className="grid grid-2">
          <ContestForm schema={contest.formSchema} dnfProfile={profileMock.dnfProfile} />
          <div className="form-block">
            <div className="form-step">참가 안내</div>
            <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, color: "var(--ink-soft)" }}>
              <li>모험단명/캐릭터명은 내 페이지의 던파 프로필에서 자동 채워집니다.</li>
              <li>코디 사진은 1장. 식별 가능한 화질이면 충분.</li>
              <li>제출 후에도 마감 전까진 수정 가능.</li>
              <li>마감 후 허락이 후보를 추리고 시청자 투표가 시작됩니다.</li>
            </ul>
            <div className="callout-box is-pending">
              <strong>안내</strong>
              백엔드 연결 전이라 실제 제출은 동작하지 않습니다. 양식 미리보기로 사용하세요.
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
