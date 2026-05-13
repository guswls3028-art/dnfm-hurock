"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { navItems, siblingSite, siteMeta } from "@/lib/content";
import { isAdmin, useCurrentUser } from "@/lib/use-current-user";

/**
 * SiteHeader — B급 톤 sticky 헤더.
 *  - wordmark: "허락!" 노란 sticker
 *  - nav: 홈/콘테스트/허락방/내 페이지 (+ admin 일 때 어드민)
 *  - 우측: 자매 사이트 dashed pill + 로그인 / 사용자 정보 토글
 *
 * activePath = "/contests" 등 prefix 매칭.
 */
export default function SiteHeader({ activePath = "/" }) {
  const router = useRouter();
  const { user, loading, logout } = useCurrentUser();

  const visibleNav = [
    ...navItems,
    ...(isAdmin(user) ? [{ href: "/admin", label: "어드민" }] : []),
  ];

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="allow-header">
      <div className="allow-header-inner">
        <Link className="allow-brand" href="/" aria-label={`${siteMeta.brand} 홈`}>
          <span className="allow-brand-mark" aria-hidden="true">
            허
          </span>
          <span className="allow-brand-wordmark">{siteMeta.wordmark}</span>
          <span className="allow-brand-sub">allow.dnfm.kr</span>
        </Link>

        <nav className="allow-nav" aria-label="사이트 메뉴">
          {visibleNav.map((item) => {
            const isActive =
              item.href === "/"
                ? activePath === "/"
                : activePath === item.href || activePath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "is-active" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="allow-header-right">
          <a
            className="allow-sibling-pill"
            href={siblingSite.href}
            target="_blank"
            rel="noreferrer"
            title={siblingSite.note}
          >
            ↗ {siblingSite.label}
          </a>
          {loading ? (
            <span className="allow-header-cta" style={{ opacity: 0.55 }}>...</span>
          ) : user ? (
            <div className="allow-header-userwrap">
              <Link href="/profile" className="allow-header-user" title="내 페이지">
                <span className="allow-header-user-name">{user.displayName || user.username}</span>
                {isAdmin(user) && (
                  <span className="allow-header-user-tag">ADMIN</span>
                )}
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
  );
}
