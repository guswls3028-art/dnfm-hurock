"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { useCurrentUser } from "@/lib/use-current-user";

const CAPTURE_TONE = {
  ok: "lime",
  pending: "amber",
  rejected: "pink",
};

const CAPTURE_LABEL = {
  ok: "등록완료",
  pending: "심사대기",
  rejected: "반려",
};

const HISTORY_TONE = {
  draft: "ink",
  open: "pink",
  judging: "amber",
  voting: "cyan",
  completed: "amber",
};

const HISTORY_LABEL = {
  draft: "임시저장",
  open: "참가중",
  judging: "심사중",
  voting: "투표중",
  completed: "결과발표",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useCurrentUser();

  if (loading) {
    return (
      <PageShell activePath="/profile">
        <div className="page-head">
          <h1>로딩 중…</h1>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell activePath="/profile">
        <div className="page-head">
          <div>
            <h1>로그인이 필요합니다</h1>
            <p>내 페이지를 보려면 먼저 로그인하세요.</p>
          </div>
          <StickerBadge tone="pink" rotate="r">로그인 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/profile")}`}
          className="btn btn-primary"
        >
          로그인 / 가입
        </Link>
      </PageShell>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  const userBadges = Array.isArray(user.badges) ? user.badges : [];
  const account = {
    nickname: user.displayName || user.username,
    joinedAt: user.joinedAt || user.created_at || "-",
    provider: user.provider || (user.providerType === "google" ? "Google" : user.providerType === "kakao" ? "Kakao" : "자체"),
    badges: userBadges,
  };
  const dnfProfile = user.dnfProfile || {};
  const captures = Array.isArray(dnfProfile.captures) ? dnfProfile.captures : [];
  const contestHistory = Array.isArray(user.contestHistory) ? user.contestHistory : [];
  const adventureName = dnfProfile.adventureName || dnfProfile.adventurerName;
  const characterName = dnfProfile.characterName || dnfProfile.mainCharacterName;
  const serverName = dnfProfile.serverName || dnfProfile.mainCharacterServer;

  return (
    <PageShell activePath="/profile">
      <div className="page-head">
        <div>
          <h1>
            내 페이지 <StickerBadge tone="cyan" rotate="r">{account.nickname}</StickerBadge>
          </h1>
          <p>회원 정보 · 던파 프로필 · 콘테스트 참가 이력.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/profile/edit" className="btn btn-ghost btn-sm">
            프로필 편집
          </Link>
          <Link href="/profile/password" className="btn btn-ghost btn-sm">
            비밀번호 변경
          </Link>
          <Link href="/profile/sessions" className="btn btn-ghost btn-sm">
            로그인 디바이스
          </Link>
          <Link href="/profile/delete" className="btn btn-ghost btn-sm" style={{ color: "var(--pink, #ff4d8d)" }}>
            회원 탈퇴
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/^(google|kakao)_[a-f0-9]{4,}/i.test(user.displayName || "") ? (
        <section className="callout-box" style={{ marginBottom: 16, borderColor: "var(--primary)", borderWidth: 2 }}>
          <strong>닉네임을 설정해 주세요</strong>
          <p style={{ margin: "8px 0 12px", lineHeight: 1.7 }}>
            소셜 로그인 후 임시 닉네임이 부여됐습니다. 본인의 닉네임으로 변경해 주세요.
          </p>
          <Link href="/profile/edit" className="btn btn-primary btn-sm">
            프로필 편집으로 가기 →
          </Link>
        </section>
      ) : null}

      <section className="section" aria-labelledby="profile-account">
        <div className="section-head">
          <h2 id="profile-account">회원 정보</h2>
        </div>
        <article className="form-block">
          <dl className="kvs">
            <dt>닉네임</dt>
            <dd>{account.nickname}</dd>
            <dt>로그인 방식</dt>
            <dd>{account.provider}</dd>
            <dt>가입일</dt>
            <dd>{account.joinedAt}</dd>
            <dt>뱃지</dt>
            <dd>
              {account.badges.length === 0 ? (
                <span style={{ color: "var(--muted)" }}>아직 없음</span>
              ) : (
                account.badges.map((b) => (
                  <StickerBadge key={b} tone="amber" rotate="0">
                    {b}
                  </StickerBadge>
                ))
              )}
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
              <dd>{adventureName || "(미등록)"}</dd>
              <dt>대표 캐릭터</dt>
              <dd>{characterName || "(미등록)"}</dd>
              <dt>서버</dt>
              <dd>{serverName || "(미등록)"}</dd>
            </dl>
          </article>
          <article className="form-block">
            <div className="form-step">캡처 인증 상태</div>
            {captures.length === 0 ? (
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                아직 저장된 인증 기록이 없습니다.
              </p>
            ) : captures.map((cap) => (
              <div
                key={cap.key}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
              >
                <span style={{ fontWeight: 800 }}>{cap.label}</span>
                <StickerBadge tone={CAPTURE_TONE[cap.state] || "amber"} rotate="0">
                  {CAPTURE_LABEL[cap.state] || cap.state}
                </StickerBadge>
              </div>
            ))}
            <Link href="/profile/verify" className="btn btn-sm">
              인증 갱신
            </Link>
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
          {contestHistory.length === 0 ? (
            <div className="board-row">
              <span style={{ gridColumn: "1 / -1", color: "var(--muted)", padding: "12px" }}>
                아직 참가한 콘테스트가 없습니다.
              </span>
            </div>
          ) : (
            contestHistory.map((h) => (
              <Link href={`/contests/${h.id}`} key={h.id} className="board-row">
                <span>
                  <StickerBadge tone={HISTORY_TONE[h.status] || "amber"} rotate="0">
                    {HISTORY_LABEL[h.status] || h.status}
                  </StickerBadge>
                </span>
                <span className="board-row-title">{h.title}</span>
                <span className="board-row-meta">{h.role || "참가자"}</span>
                <span className="board-row-meta">{h.entry || "-"}</span>
                <span className="board-row-meta">{h.rank ? `${h.rank}등` : "-"}</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
