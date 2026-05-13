import Link from "next/link";
import { navItems, siblingSite, siteMeta } from "@/lib/content";

/**
 * SiteHeader — B급 톤 sticky 헤더.
 *  - wordmark: "허락!" 노란 sticker
 *  - nav: 홈/콘테스트/허락방/내 페이지
 *  - 우측: 자매 사이트 dashed pill + 로그인 CTA
 *
 * activePath = "/contests" 등 prefix 매칭.
 */
export default function SiteHeader({ activePath = "/" }) {
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
          {navItems.map((item) => {
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
          <Link className="allow-header-cta" href="/login">
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
