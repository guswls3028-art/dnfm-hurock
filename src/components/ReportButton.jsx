"use client";

import { useState } from "react";
import { reports as reportsApi, ApiError } from "@/lib/api-client";

const REASONS = [
  { value: "spam", label: "도배/광고" },
  { value: "abuse", label: "욕설/비방" },
  { value: "porn", label: "음란물" },
  { value: "hate", label: "혐오 표현" },
  { value: "privacy", label: "개인정보 노출" },
  { value: "copyright", label: "저작권 침해" },
  { value: "advertise", label: "외부 거래/광고" },
  { value: "malicious_link", label: "악성 링크" },
  { value: "other", label: "기타" },
];

/**
 * 신고 버튼 + 모달 (hurock 톤 — 핫핑크/노랑/시안 + sticker 느낌).
 * 비회원도 신고 가능. backend dedup: 회원 unique / 비회원 fingerprint.
 */
export default function ReportButton({ targetType, targetId, small }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await reportsApi.create({
        targetType,
        targetId,
        reason,
        detail: detail.trim() || undefined,
      });
      setMsg({ ok: true, text: "신고 접수됨" });
      setTimeout(() => {
        setOpen(false);
        setMsg(null);
        setDetail("");
      }, 1100);
    } catch (err) {
      const text =
        err instanceof ApiError && err.code === "already_reported"
          ? "이미 신고했어요."
          : err?.message || "신고 실패";
      setMsg({ ok: false, text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={small ? "btn btn-ghost btn-xs" : "btn btn-ghost btn-sm"}
        onClick={() => setOpen(true)}
        title="신고하기"
      >
        🚩 신고
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="신고하기"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,18,12,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 200,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="callout-box"
            style={{
              maxWidth: 460,
              width: "100%",
              padding: 20,
              display: "grid",
              gap: 12,
              background: "var(--paper, #fffef7)",
              border: "1px dashed var(--hot-pink, #ff3ea5)",
              borderRadius: 14,
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: 18 }}>🚩 신고하기</strong>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </header>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted, #8c7a55)" }}>
              허위 신고는 운영 정책에 따라 제재될 수 있어요.
            </p>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>사유</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input"
                style={{ padding: "8px 10px" }}
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>상세 (선택)</span>
              <textarea
                rows={3}
                maxLength={2000}
                className="input"
                style={{ padding: "8px 10px", resize: "vertical" }}
                placeholder="추가 설명이 필요하면 적어주세요."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
            </label>
            {msg ? (
              <p
                role="status"
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: msg.ok ? "var(--accent-cyan, #06a3d6)" : "var(--hot-pink, #ff3ea5)",
                }}
              >
                {msg.text}
              </p>
            ) : null}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                취소
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={submit}
                disabled={busy}
              >
                {busy ? "전송 중…" : "신고"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
