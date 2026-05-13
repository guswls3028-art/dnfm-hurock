"use client";

import Link from "next/link";
import { useEffect } from "react";
import { sideMenu, siteMeta } from "@/lib/content";

/**
 * SideMenu — 햄버거 클릭 시 좌측 슬라이드인 패널 (던파 공홈 사이드 메뉴 레이어).
 *  - 섹션 다단 (새소식 / 방송 / 커뮤니티 / 내 정보 / 친구들)
 *  - 외부 링크는 새창
 *  - Escape 키 / 백드롭 클릭으로 닫기
 *  - body scroll lock when open
 */
export default function SideMenu({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`side-menu__backdrop${open ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        className={`side-menu${open ? " is-open" : ""}`}
        aria-hidden={!open}
        aria-label="전체 메뉴"
      >
        <header className="side-menu__head">
          <span className="side-menu__brand">{siteMeta.wordmark || siteMeta.brand}</span>
          <button
            type="button"
            className="side-menu__close"
            onClick={onClose}
            aria-label="메뉴 닫기"
          >
            ×
          </button>
        </header>
        <nav className="side-menu__body">
          {sideMenu.map((sec) => (
            <section key={sec.section} className="side-menu__section">
              <h3>{sec.section}</h3>
              <ul>
                {sec.items.map((it) => (
                  <li key={it.label}>
                    {it.external ? (
                      <a href={it.href} target="_blank" rel="noreferrer" onClick={onClose}>
                        {it.label}
                      </a>
                    ) : (
                      <Link href={it.href} onClick={onClose}>
                        {it.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}
