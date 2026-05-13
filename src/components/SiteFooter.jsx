import { siblingSite, siteMeta } from "@/lib/content";

/**
 * SiteFooter — disclaimer + 자매 사이트 cross-link (hardcoded dnfm.kr URL).
 */
export default function SiteFooter() {
  return (
    <footer className="allow-footer">
      <div className="allow-footer-inner">
        <div>
          <p>
            {siteMeta.brand} · {siteMeta.tagline}
          </p>
          <small>{siteMeta.footerNote}</small>
        </div>
        <div className="allow-footer-links">
          <a href={siblingSite.href} target="_blank" rel="noreferrer">
            ↗ {siblingSite.label} (dnfm.kr)
          </a>
          <a href="mailto:allow@dnfm.kr">문의 메일</a>
        </div>
      </div>
    </footer>
  );
}
