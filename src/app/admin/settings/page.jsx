"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { chatRooms, platforms, sponsor } from "@/lib/content";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

/**
 * 사이트 설정 — 운영자가 자주 확인하는 연결 지점과 관리 화면을 한곳에 모은다.
 */
export default function AdminSettingsPage() {
  const { user, loading: userLoading } = useCurrentUser();

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
            <p>사이트 설정은 운영자 전용입니다.</p>
          </div>
          <StickerBadge tone="ink" rotate="r">권한 필요</StickerBadge>
        </div>
        <Link
          href={`/login?returnTo=${encodeURIComponent("/admin/settings")}`}
          className="btn btn-primary"
        >
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
            사이트 설정 <StickerBadge tone="lime" rotate="r">셀프서비스</StickerBadge>
          </h1>
          <p>배너, 채널, 후원, 게시판 운영 동선을 확인합니다.</p>
        </div>
        <Link href="/admin" className="btn btn-sm">← 어드민 홈</Link>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>관리 바로가기</h2>
        </div>
        <div className="grid grid-2">
          <article className="card card-tone-pink">
            <h3>🎨 메인 슬라이딩 배너</h3>
            <p>홈 화면 최상단 슬라이딩 배너 추가/제거/순서/활성화. 이벤트 종료 자동 비활성도 가능.</p>
            <div className="card-actions">
              <Link href="/" className="btn btn-sm btn-primary">
                홈으로 → 우상단 ⚙ 톱니바퀴 클릭
              </Link>
            </div>
          </article>

          <article className="card card-tone-cyan">
            <h3>🎯 콘테스트</h3>
            <p>새 콘테스트 생성, 참가작 심사, 후보 선정, 투표 / 결과 발표.</p>
            <div className="card-actions">
              <Link href="/admin" className="btn btn-sm btn-primary">
                콘테스트 관리
              </Link>
            </div>
          </article>

          <article className="card card-tone-amber">
            <h3>📋 게시판</h3>
            <p>회원이 올린 글 목록 + 부적절한 글 즉시 삭제.</p>
            <div className="card-actions">
              <Link href="/admin/board" className="btn btn-sm btn-primary">
                게시판 관리
              </Link>
            </div>
          </article>

          <article className="card card-tone-lime">
            <h3>💬 신고함</h3>
            <p>게시글·댓글 신고를 확인하고 처리 결과를 남깁니다.</p>
            <div className="card-actions">
              <Link href="/admin/reports" className="btn btn-sm btn-primary">
                신고함 열기
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>현재 연결 정보</h2>
        </div>
        <div className="grid grid-2">
          <article className="form-block">
            <div className="form-step">방송 채널</div>
            <div className="grid" style={{ gap: 8 }}>
              {platforms.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="board-row"
                  style={{ gridTemplateColumns: "110px minmax(0,1fr) 70px" }}
                >
                  <strong>{p.label}</strong>
                  <span className="board-row-meta">{p.note}</span>
                  <span className="board-row-meta">열기 →</span>
                </a>
              ))}
            </div>
          </article>

          <article className="form-block">
            <div className="form-step">후원 / 톡방</div>
            <div className="grid" style={{ gap: 8 }}>
              <a
                href={sponsor.url}
                target="_blank"
                rel="noreferrer"
                className="board-row"
                style={{ gridTemplateColumns: "110px minmax(0,1fr) 70px" }}
              >
                <strong>{sponsor.label}</strong>
                <span className="board-row-meta">{sponsor.perkHeadline}</span>
                <span className="board-row-meta">열기 →</span>
              </a>
              {chatRooms.map((room) => (
                <a
                  key={room.id}
                  href={room.url}
                  target="_blank"
                  rel="noreferrer"
                  className="board-row"
                  style={{ gridTemplateColumns: "110px minmax(0,1fr) 70px" }}
                >
                  <strong>{room.primary ? "메인 톡방" : "1:1 문의"}</strong>
                  <span className="board-row-meta">{room.label}</span>
                  <span className="board-row-meta">열기 →</span>
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
