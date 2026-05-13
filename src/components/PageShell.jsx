import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * PageShell — 공통 shell.
 *  - sticky header (activePath nav)
 *  - main (flex 1)
 *  - footer
 */
export default function PageShell({ children, activePath = "/" }) {
  return (
    <div className="allow-shell">
      <SiteHeader activePath={activePath} />
      <main className="allow-main" id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
