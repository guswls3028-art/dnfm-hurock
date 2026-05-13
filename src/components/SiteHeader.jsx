"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { host, siteMeta } from "@/lib/content";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";
import SideMenu from "@/components/SideMenu";

/**
 * SiteHeader — 던파 공홈 헤더 레이어 차용.
 *  - 좌: ☰ 햄버거 (SideMenu 토글)
 *  - 중앙: 로고 (avatar + 워드마크)
 *  - 우: 로그인/가입 또는 사용자 닉네임 + 로그아웃 (admin = 어드민 chip)
 *
 * B급 디자인 토큰 유지 (paper bg / ink border / sticker rotate).
 */
export default function SiteHeader() {
  const router = useRouter();
  const { user, loading, logout } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="allow-header">
        <div className="allow-header-inner">
          <button
            type="button"
            className="allow-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
          >
            <span aria-hidden="true">☰</span>
          </button>

          <Link className="allow-brand" href="/" aria-label={`${siteMeta.brand} 홈`}>
            <span className="allow-brand-mark allow-brand-mark--image" aria-hidden="true">
              {host.avatarSrc ? (
                <Image
                  src={host.avatarSrc}
                  alt=""
                  width={32}
                  height={32}
                  priority
                  unoptimized
                />
              ) : (
                "허"
              )}
            </span>
            <span className="allow-brand-wordmark">{siteMeta.wordmark}</span>
          </Link>

          <div className="allow-header-right">
            {loading ? (
              <span className="allow-header-cta" style={{ opacity: 0.55 }}>...</span>
            ) : user ? (
              <div className="allow-header-userwrap">
                <Link href="/profile" className="allow-header-user" title="내 페이지">
                  <span className="allow-header-user-name">{user.displayName || user.username}</span>
                  {isAdmin(user) && <span className="allow-header-user-tag">ADMIN</span>}
                </Link>
                <button
                  type="button"
                  className="allow-header-logout"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <Link className="allow-header-cta" href="/login">
                  로그인
                </Link>
                <Link className="allow-header-cta-sub" href="/signup">
                  가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
