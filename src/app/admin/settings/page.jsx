"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

/**
 * 사이트 설정 — 현재 편집 가능한 항목은 배너 (홈 ⚙ fab) 만.
 * 후원 URL / 톡방 URL / 채널 URL / 운영 정책 텍스트 등은 backend 가 받쳐주면 여기로 통합.
 */
export default function AdminSettingsPage() {
  const { user, loading: userLoading } = useCurrentUser();

  if (!userLoading && !user) {
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

  if (!userLoading && user && !isAdmin(user)) {
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
          <p>지금 만질 수 있는 항목 + 다음 단계 백엔드 작업.</p>
        </div>
        <Link href="/admin" className="btn btn-sm">← 어드민 홈</Link>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>지금 만질 수 있는 항목</h2>
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
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>다음 단계 — 백엔드 작업이 필요한 설정</h2>
        </div>
        <div className="callout-box is-pending">
          <strong>준비중</strong>
          <ul style={{ margin: "8px 0 0 18px" }}>
            <li>후원 (toon.donate) URL 변경</li>
            <li>방송 채널 URL (SOOP / 치지직 / 유튜브) 변경</li>
            <li>오픈채팅방 URL 변경</li>
            <li>사이트 풋터 안내 텍스트 / 공지사항 편집</li>
            <li>회원 권한 / 차단 (회원 관리 메뉴 참조)</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            지금은 코드 (<code>src/lib/content.js</code>) 직접 수정 + 배포로 운영 중. 자주 바뀌는 항목 우선으로 편집 UI 추가 예정.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
