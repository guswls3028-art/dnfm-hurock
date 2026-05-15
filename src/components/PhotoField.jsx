"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/lib/upload";
import { uploadPublicUrl } from "@/lib/upload-url";

/**
 * PhotoField — 사진 업로드 + 표시 영역(crop) 조절.
 *
 * value shape:
 *   { r2Key: string, crop: { x, y, w, h } }   // x,y,w,h ∈ [0,1] (비율)
 *
 * 원본 R2 파일은 immutable. crop 은 표시용 메타데이터로만 저장.
 * 컨테이너 내부에서 드래그(박스 이동) + 4 모서리(리사이즈) UI.
 */
export default function PhotoField({ field, value, onChange, purpose = "contest_entry" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [filename, setFilename] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null); // 로컬 ObjectURL — 즉시 미리보기
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const r2Key = value?.r2Key || null;
  const crop = value?.crop || DEFAULT_CROP;
  const remoteUrl = !previewUrl && r2Key ? uploadPublicUrl(r2Key) : null;

  useEffect(() => {
    // 컴포넌트 언마운트 시 ObjectURL 회수
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setFilename(file.name);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { r2Key: newKey } = await uploadFile(file, { purpose });
      onChange({ r2Key: newKey, crop: DEFAULT_CROP });
    } catch (err) {
      setError(err);
    } finally {
      setUploading(false);
    }
  }

  function pointerNorm(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function onPointerDown(e, mode) {
    e.preventDefault();
    e.stopPropagation();
    const start = pointerNorm(e);
    dragRef.current = { mode, start, startCrop: { ...crop } };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragRef.current) return;
    const { mode, start, startCrop } = dragRef.current;
    const p = pointerNorm(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    const next = computeNextCrop(mode, startCrop, dx, dy);
    onChange({ r2Key, crop: next });
  }

  function onPointerUp(e) {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
  }

  function resetCrop() {
    onChange({ r2Key, crop: DEFAULT_CROP });
  }

  const cropStyle = {
    left: `${crop.x * 100}%`,
    top: `${crop.y * 100}%`,
    width: `${crop.w * 100}%`,
    height: `${crop.h * 100}%`,
  };

  const id = `field-${field.key}`;

  return (
    <div className="form-row photo-field">
      <label htmlFor={id}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      <input
        id={id}
        type="file"
        accept={field.accept || "image/*"}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="form-input"
      />

      {(previewUrl || r2Key) && (
        <div className="photo-field-canvas-wrap">
          <div
            ref={canvasRef}
            className="photo-field-canvas"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {previewUrl || remoteUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl || remoteUrl} alt="" className="photo-field-img" draggable={false} />
            ) : (
              <div className="photo-field-placeholder">업로드된 사진 ({r2Key})</div>
            )}
            <div
              className="photo-field-crop"
              style={cropStyle}
              onPointerDown={(e) => onPointerDown(e, "move")}
            >
              <span className="photo-field-handle is-tl" onPointerDown={(e) => onPointerDown(e, "tl")} />
              <span className="photo-field-handle is-tr" onPointerDown={(e) => onPointerDown(e, "tr")} />
              <span className="photo-field-handle is-bl" onPointerDown={(e) => onPointerDown(e, "bl")} />
              <span className="photo-field-handle is-br" onPointerDown={(e) => onPointerDown(e, "br")} />
            </div>
          </div>
          <div className="photo-field-meta">
            <small>
              표시 영역 {Math.round(crop.w * 100)}% × {Math.round(crop.h * 100)}%
              {" "}· 위치 ({Math.round(crop.x * 100)}%, {Math.round(crop.y * 100)}%)
            </small>
            <button type="button" className="btn btn-sm" onClick={resetCrop}>
              영역 초기화
            </button>
          </div>
        </div>
      )}

      {uploading && <small>업로드 중… ({filename})</small>}
      {r2Key && !uploading && (
        <small style={{ color: "var(--primary-ink)" }}>✓ 업로드 완료 — 박스를 드래그해 표시 영역 조절</small>
      )}
      {error && (
        <small style={{ color: "var(--danger)" }}>
          업로드 실패: {error.message || "재시도 해주세요"}
        </small>
      )}
      {field.help && <small style={{ color: "var(--muted)" }}>{field.help}</small>}
    </div>
  );
}

const DEFAULT_CROP = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
const MIN_SIZE = 0.1;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function computeNextCrop(mode, start, dx, dy) {
  let { x, y, w, h } = start;
  if (mode === "move") {
    x = clamp01(x + dx);
    y = clamp01(y + dy);
    if (x + w > 1) x = 1 - w;
    if (y + h > 1) y = 1 - h;
    return { x, y, w, h };
  }
  // resize from a corner
  let nx = x, ny = y, nw = w, nh = h;
  if (mode === "tl") { nx = x + dx; ny = y + dy; nw = w - dx; nh = h - dy; }
  if (mode === "tr") { ny = y + dy; nw = w + dx; nh = h - dy; }
  if (mode === "bl") { nx = x + dx; nw = w - dx; nh = h + dy; }
  if (mode === "br") { nw = w + dx; nh = h + dy; }
  // 최소 크기 보장
  if (nw < MIN_SIZE) {
    if (mode === "tl" || mode === "bl") nx = x + (w - MIN_SIZE);
    nw = MIN_SIZE;
  }
  if (nh < MIN_SIZE) {
    if (mode === "tl" || mode === "tr") ny = y + (h - MIN_SIZE);
    nh = MIN_SIZE;
  }
  // 경계 clamp
  if (nx < 0) { nw += nx; nx = 0; }
  if (ny < 0) { nh += ny; ny = 0; }
  if (nx + nw > 1) nw = 1 - nx;
  if (ny + nh > 1) nh = 1 - ny;
  if (nw < MIN_SIZE) nw = MIN_SIZE;
  if (nh < MIN_SIZE) nh = MIN_SIZE;
  return { x: nx, y: ny, w: nw, h: nh };
}
