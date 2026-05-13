"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";

/**
 * AdminPostMenu — board/[id] 헤더의 운영 드롭다운.
 *
 * Props:
 *   postId  : 글 ID
 *   pinned  : 현재 pinned 여부
 *   onChange: 토글/삭제 후 호출 (parent 가 reload)
 *
 * Backend:
 *   PATCH /sites/hurock/posts/:id  { pinned: true|false }   (admin only)
 *   DELETE /sites/hurock/posts/:id                           (admin only, soft delete)
 */
export default function AdminPostMenu({ postId, pinned, onChange }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function togglePinned() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/sites/hurock/posts/${encodeURIComponent(postId)}`, {
        method: "PATCH",
        json: { pinned: !pinned },
      });
      setMsg(pinned ? "고정 해제됨" : "상단에 고정됨");
      setOpen(false);
      if (typeof onChange === "function") await onChange();
    } catch (err) {
      const m =
        err instanceof ApiError ? `${err.message} (${err.status})` : err?.message;
      setMsg(m || "처리 실패");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost() {
    if (busy) return;
    if (
      !window.confirm(
        "이 글을 삭제하시겠습니까? (soft delete — 운영 기록은 남습니다)",
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/sites/hurock/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });
      router.push("/board");
    } catch (err) {
      const m =
        err instanceof ApiError ? `${err.message} (${err.status})` : err?.message;
      setMsg(m || "삭제 실패");
      setBusy(false);
    }
  }

  return (
    <div className="admin-menu" ref={wrapRef}>
      <button
        type="button"
        className="btn btn-sm admin-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="운영 도구"
        disabled={busy}
      >
        🛡️ 운영 ▾
      </button>
      {open ? (
        <div className="admin-menu__panel" role="menu">
          <button
            type="button"
            role="menuitem"
            className="admin-menu__item"
            onClick={togglePinned}
            disabled={busy}
          >
            {pinned ? "📌 고정 해제" : "📌 상단 고정"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="admin-menu__item admin-menu__item--danger"
            onClick={deletePost}
            disabled={busy}
          >
            🗑 글 삭제
          </button>
        </div>
      ) : null}
      {msg ? <small className="admin-menu__msg">{msg}</small> : null}
    </div>
  );
}
