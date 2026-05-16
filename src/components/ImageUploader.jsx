"use client";

import { useCallback, useEffect, useState } from "react";
import { uploadFile } from "@/lib/upload";
import { buildApiUrl } from "@/lib/api-client";

/**
 * ImageUploader (hurock) — 다중 이미지 첨부, B급 톤.
 * 회원만. jpg/png/webp/gif 허용, svg 금지, 10MB 이하.
 */

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 10 * 1024 * 1024;

function clipboardImages(event) {
  const items = Array.from(event.clipboardData?.items || []);
  const fromItems = items
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter(Boolean);
  if (fromItems.length > 0) return fromItems;
  return Array.from(event.clipboardData?.files || []).filter((file) =>
    file.type.startsWith("image/"),
  );
}

export default function ImageUploader({ value = [], onChange, max = 5 }) {
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState([]);
  const [info, setInfo] = useState("");

  const queueFiles = useCallback(
    async (incoming, sourceLabel = "선택한") => {
      if (busy) return;
      const files = Array.from(incoming || []);
    if (files.length === 0) return;
    const remaining = max - value.length;
    if (remaining <= 0) {
      setErrs([`최대 ${max}장까지만 첨부할 수 있어요.`]);
      return;
    }
    const toUpload = files.slice(0, remaining);
      setBusy(true);
      setErrs([]);
      setInfo("");
      const newErrs = [];
      const newKeys = [];
      for (const f of toUpload) {
        if (!ALLOWED_MIME.has(f.type)) {
          newErrs.push(`${f.name || "이미지"}: 형식 X (jpg/png/webp/gif만)`);
          continue;
        }
        if (f.size > MAX_SIZE) {
          newErrs.push(`${f.name || "이미지"}: 10MB 초과`);
          continue;
        }
        try {
          const { r2Key } = await uploadFile(f, { purpose: "post_attachment" });
          newKeys.push(r2Key);
        } catch (err) {
          newErrs.push(`${f.name || "이미지"}: 업로드 실패 (${err?.message || "오류"})`);
        }
      }
      setBusy(false);
      if (newKeys.length > 0) {
        onChange([...value, ...newKeys]);
        setInfo(`${sourceLabel} 이미지 ${newKeys.length}장 첨부 완료`);
      }
      if (newErrs.length > 0) setErrs(newErrs);
    },
    [busy, max, onChange, value],
  );

  useEffect(() => {
    function onPaste(event) {
      const images = clipboardImages(event);
      if (images.length === 0) return;
      event.preventDefault();
      queueFiles(images, "붙여넣은");
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [queueFiles]);

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    await queueFiles(files, "선택한");
  }

  function onDrop(e) {
    e.preventDefault();
    queueFiles(Array.from(e.dataTransfer?.files || []), "끌어온");
  }

  function remove(idx) {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div
      className="image-uploader image-uploader--hurock"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <label
        className={`image-uploader__dropzone${busy ? " is-busy" : ""}`}
        style={{ cursor: busy ? "wait" : "pointer" }}
      >
        <span className="image-uploader__icon">+</span>
        <span className="image-uploader__copy">
          <strong>{busy ? "업로드 중…" : "이미지 추가"}</strong>
          <small>파일 선택, 드래그, Ctrl+V 붙여넣기</small>
        </span>
        <span className="image-uploader__count">
          {value.length}/{max} · jpg/png/webp/gif · 10MB 이하
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={busy || value.length >= max}
          onChange={onPick}
          style={{ display: "none" }}
        />
      </label>

      {value.length > 0 ? (
        <div className="image-uploader__grid">
          {value.map((key, i) => (
            <div
              key={`${key}-${i}`}
              className="image-uploader__thumb"
            >
              <img
                src={buildApiUrl(`/uploads/r2/${encodeURIComponent(key)}`)}
                alt=""
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="첨부 삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {info ? <p className="image-uploader__info" role="status">{info}</p> : null}

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
