import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { profileMock } from "@/lib/content";

export const metadata = { title: "내 페이지" };

const CAPTURE_TONE = {
  ok: "lime",
  pending: "amber",
  rejected: "pink"
};

const CAPTURE_LABEL = {
  ok: "등록완료",
  pending: "심사대기",
  rejected: "반려"
};

const HISTORY_TONE = {
  submission: "pink",
  voting: "cyan",
  ended: "ink",
  announced: "amber"
};

const HISTORY_LABEL = {
  submission: "참가중",
  voting: "투표중",
  ended: "종료",
  announced: "결과발표"
};

export default function ProfilePage() {
  const { account, dnfProfile, contestHistory } = profileMock;
  return (
    <PageShell activePath="/profile">
      <div className="page-head">
        <div>
          <h1>
            내 페이지 <StickerBadge tone="cyan" rotate="r">{account.nickname}</StickerBadge>
          </h1>
          <p>회원 정보 · 던파 프로필 · 콘테스트 참가 이력.</p>
        </div>
        <button type="button" className="btn btn-ghost is-disabled" disabled>
          로그아웃 <span className="btn-note">(준비중)</span>
        </button>
      </div>

      <section className="section" aria-labelledby="profile-account">
        <div className="section-head">
          <h2 id="profile-account">회원 정보</h2>
        </div>
        <article className="form-block">
          <dl className="kvs">
            <dt>닉네임</dt>
            <dd>{account.nickname}</dd>
            <dt>이메일</dt>
            <dd>{account.email}</dd>
            <dt>로그인 방식</dt>
            <dd>{account.provider}</dd>
            <dt>가입일</dt>
            <dd>{account.joinedAt}</dd>
            <dt>뱃지</dt>
            <dd>
              {account.badges.map((b) => (
                <StickerBadge key={b} tone="amber" rotate="0">
                  {b}
                </StickerBadge>
              ))}
            </dd>
          </dl>
        </article>
      </section>

      <section className="section" aria-labelledby="profile-dnf">
        <div className="section-head">
          <h2 id="profile-dnf">던파 프로필</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.84rem", fontWeight: 800 }}>
            콘테스트 참가 시 자동으로 채워집니다
          </span>
        </div>
        <div className="grid grid-2">
          <article className="form-block">
            <dl className="kvs">
              <dt>모험단</dt>
              <dd>{dnfProfile.adventureName}</dd>
              <dt>대표 캐릭터</dt>
              <dd>{dnfProfile.characterName}</dd>
              <dt>서버</dt>
              <dd>{dnfProfile.serverName}</dd>
            </dl>
          </article>
          <article className="form-block">
            <div className="form-step">캡처 인증 상태</div>
            {dnfProfile.captures.map((cap) => (
              <div key={cap.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800 }}>{cap.label}</span>
                <StickerBadge tone={CAPTURE_TONE[cap.state]} rotate="0">
                  {CAPTURE_LABEL[cap.state]}
                </StickerBadge>
              </div>
            ))}
            <button type="button" className="btn btn-sm is-disabled" disabled>
              캡처 재업로드 <span className="btn-note">(준비중)</span>
            </button>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="profile-contest">
        <div className="section-head">
          <h2 id="profile-contest">내 콘테스트 이력</h2>
        </div>
        <div className="board-list">
          <div className="board-row is-head">
            <span>상태</span>
            <span>콘테스트</span>
            <span>역할</span>
            <span>출품</span>
            <span>등수</span>
          </div>
          {contestHistory.map((h) => (
            <Link href={`/contests/${h.id}`} key={h.id} className="board-row">
              <span>
                <StickerBadge tone={HISTORY_TONE[h.status]} rotate="0">
                  {HISTORY_LABEL[h.status]}
                </StickerBadge>
              </span>
              <span className="board-row-title">{h.title}</span>
              <span className="board-row-meta">{h.role}</span>
              <span className="board-row-meta">{h.entry}</span>
              <span className="board-row-meta">{h.rank ? `${h.rank}등` : "-"}</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
