"use client";

import Link from "next/link";

/**
 * Pagination — 게시판 등에서 page=N 쿼리 페이지네이션.
 *
 * Props:
 *   current  : 현재 페이지 (1-base, 기본 1)
 *   total    : 총 글 수 (백엔드 total) — pageSize 로 나눠서 마지막 페이지 계산
 *   pageSize : 페이지당 글 수 (기본 20)
 *   buildHref: (page: number) => string — 각 페이지 링크의 href 생성
 *   maxButtons: 가운데 노출할 최대 숫자 버튼 수 (기본 7)
 *
 * 구성:
 *   [‹ 이전] [1] … [현재-2 현재-1 현재 현재+1 현재+2] … [마지막] [다음 ›]
 *
 * 총 페이지가 1 이하이면 아무것도 렌더링 X.
 */
export default function Pagination({
  current = 1,
  total = 0,
  pageSize = 20,
  buildHref,
  maxButtons = 7,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  if (totalPages <= 1) return null;

  const cur = Math.min(Math.max(1, Number(current) || 1), totalPages);
  const numbers = computeWindow(cur, totalPages, maxButtons);

  return (
    <nav className="pagination" aria-label="페이지 네비게이션">
      <PageLink
        href={buildHref(Math.max(1, cur - 1))}
        disabled={cur <= 1}
        rel="prev"
        ariaLabel="이전 페이지"
      >
        ‹ 이전
      </PageLink>

      {numbers.map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <PageLink
            key={n}
            href={buildHref(n)}
            isCurrent={n === cur}
            ariaLabel={`${n} 페이지`}
          >
            {n}
          </PageLink>
        ),
      )}

      <PageLink
        href={buildHref(Math.min(totalPages, cur + 1))}
        disabled={cur >= totalPages}
        rel="next"
        ariaLabel="다음 페이지"
      >
        다음 ›
      </PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, isCurrent, rel, ariaLabel, children }) {
  const cls = `pagination__btn${isCurrent ? " is-current" : ""}${disabled ? " is-disabled" : ""}`;
  if (disabled) {
    return (
      <span className={cls} aria-disabled="true" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  if (isCurrent) {
    return (
      <span className={cls} aria-current="page" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  return (
    <Link className={cls} href={href} rel={rel} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function computeWindow(cur, total, maxButtons) {
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const side = Math.floor((maxButtons - 3) / 2);
  let start = Math.max(2, cur - side);
  let end = Math.min(total - 1, cur + side);

  if (cur - start < side) {
    end = Math.min(total - 1, end + (side - (cur - start)));
  }
  if (end - cur < side) {
    start = Math.max(2, start - (side - (end - cur)));
  }

  const out = [1];
  if (start > 2) out.push("…");
  for (let n = start; n <= end; n++) out.push(n);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
