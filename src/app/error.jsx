"use client";

import { useEffect } from "react";

/**
 * 루트 라우트 에러 boundary.
 *
 * 주된 트리거: 신규 배포 직후 사용자의 옛 manifest 가 옛 청크 해시 를 요청해 404
 * → "Loading chunk N failed". 자동 reload 로 새 manifest 받아서 회복.
 */
export default function RootError({ error, reset }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const name = String(error?.name || "");
    const msg = String(error?.message || "");
    const isChunk =
      name === "ChunkLoadError" ||
      /Loading chunk \d+ failed/i.test(msg) ||
      /Loading CSS chunk/i.test(msg) ||
      /Importing a module script failed/i.test(msg);
    if (!isChunk) return;
    const key = "dnfm:last-chunk-reload";
    const last = Number(sessionStorage.getItem(key) || 0);
    const now = Date.now();
    if (now - last < 5000) return;
    sessionStorage.setItem(key, String(now));
    window.location.reload();
  }, [error]);

  return (
    <section className="section">
      <div className="page-head">
        <div>
          <h1>잠깐만요</h1>
          <p>페이지를 불러오는 데 문제가 생겼어요. 한 번 더 시도해 주세요.</p>
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        다시 시도
      </button>
    </section>
  );
}
