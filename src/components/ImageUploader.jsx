"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload";
import { buildApiUrl } from "@/lib/api-client";

/**
 * ImageUploader (hurock) — 다중 이미지 첨부, B급 톤.
 * 회원만. jpg/png/webp/gif 허용, svg 금지, 10MB 이하.
 */

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploader({ value = [], onChange, max = 5 }) {
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState([]);

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const remaining = max - value.length;
    if (remaining <= 0) {
      setErrs([`최대 ${max}장까지만 첨부할 수 있어요.`]);
      return;
    }
    const toUpload = files.slice(0, remaining);
    setBusy(true);
    setErrs([]);
    const newErrs = [];
    const newKeys = [];
    for (const f of toUpload) {
      if (!ALLOWED_MIME.has(f.type)) {
        newErrs.push(`${f.name}: 형식 X (jpg/png/webp/gif만)`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        newErrs.push(`${f.name}: 10MB 초과`);
        continue;
      }
      try {
        const { r2Key } = await uploadFile(f, { purpose: "post_attachment" });
        newKeys.push(r2Key);
      } catch (err) {
        newErrs.push(`${f.name}: 업로드 실패 (${err?.message || "오류"})`);
      }
    }
    setBusy(false);
    if (newKeys.length > 0) onChange([...value, ...newKeys]);
    if (newErrs.length > 0) setErrs(newErrs);
  }

  function remove(idx) {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label
          className="btn btn-sm btn-primary"
          style={{ cursor: busy ? "wait" : "pointer" }}
        >
          {busy ? "업로드 중…" : "📷 이미지 추가"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={busy || value.length >= max}
            onChange={onPick}
            style={{ display: "none" }}
          />
        </label>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          {value.length}/{max} · jpg/png/webp/gif · 10MB 이하
        </span>
      </div>

      {value.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 8,
          }}
        >
          {value.map((key, i) => (
            <div
              key={`${key}-${i}`}
              style={{
                position: "relative",
                aspectRatio: "1",
                border: "2px solid var(--ink, #1a1a1a)",
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--paper, #fffef7)",
              }}
            >
              <img
                src={buildApiUrl(`/uploads/r2/${encodeURIComponent(key)}`)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "var(--hot-pink, #ff3ea5)",
                  color: "#fff",
                  border: "2px solid var(--ink, #1a1a1a)",
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                aria-label="첨부 삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {errs.length > 0 ? (
        <div className="callout-box is-pending" style={{ fontSize: "0.85rem" }}>
          <strong>업로드 결과</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {errs.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
