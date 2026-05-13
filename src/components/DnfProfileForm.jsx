"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, auth } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload";
import { DNF_BASE_CLASSES_UNIQUE } from "@/lib/dnf-classes";

const KLASS_DATALIST_ID = "dnf-klass-options";

/**
 * DnfProfileForm — 가입 2단계 (단일 드롭존 + 다중 이미지 + 드래그-크롭).
 *
 * UX:
 *   1) 한 드롭존에 이미지 1~3장 드래그-드롭 또는 클릭 선택
 *   2) 업로드된 이미지마다 type chip 으로 화면 종류 선택
 *      (자동 할당: 1번째=모험단, 2번째=캐릭목록, 3번째=캐릭선택. 칩 클릭으로 변경)
 *   3) 각 이미지 위에 드래그-크롭 박스 — OCR 호출 시 크롭한 영역만 전송
 *   4) OCR 결과 = 모험단명 / 대표캐릭 / 캐릭터 목록(chip 그리드, 추가/삭제 가능)
 *
 * Backend OCR endpoint: POST /auth/dnf-profile/ocr/:type (multipart)
 *   type ∈ { basic_info, character_list, character_select }
 *   - basic_info       → { adventurerName, mainCharacterName }
 *   - character_list   → { characterNames: string[] }
 *   - character_select → { characters: [{ name, klass }] }
 *
 * 솔직한 안내: 던파 3 화면은 각각 다른 시점에 찍는 거라 한 이미지로 합치는 게
 *   비용·정확도 둘 다 떨어짐. 다만 3개 input 분리는 불편하니 한 드롭존 + 자동 type.
 */

const TYPES = [
  { key: "basic_info",       label: "모험단",     emoji: "🏷️", note: "모험단명 + 대표 캐릭" },
  { key: "character_list",   label: "캐릭 목록",  emoji: "👥", note: "보유 캐릭터 카드 화면" },
  { key: "character_select", label: "캐릭 선택",  emoji: "🔐", note: "로그인 후 본인 인증" },
];

const TYPE_BY_KEY = TYPES.reduce((acc, t) => { acc[t.key] = t; return acc; }, {});
const DEFAULT_CROP = { x: 0, y: 0, w: 1, h: 1 };
const MIN_SIZE = 0.05;

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function autoAssignType(index) {
  return TYPES[Math.min(index, TYPES.length - 1)].key;
}

export default function DnfProfileForm({ onConfirm, busyText }) {
  const [items, setItems] = useState([]); // { id, file, previewUrl, type, crop, status, ocr, error, r2Key }
  const [adventurerName, setAdventurerName] = useState("");
  const [mainCharacterName, setMainCharacterName] = useState("");
  const [characterChips, setCharacterChips] = useState([]); // [{ name, klass? }]
  const [newCharInput, setNewCharInput] = useState("");
  const [newCharKlass, setNewCharKlass] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => () => {
    items.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- 파일 추가 ---- */
  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []).filter((f) => f && f.type?.startsWith("image/"));
    if (!files.length) return;
    setItems((prev) => {
      const next = [...prev];
      files.forEach((f) => {
        if (next.length >= 6) return; // 안전 상한
        next.push({
          id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
          type: autoAssignType(next.length),
          crop: { ...DEFAULT_CROP },
          status: "ready",
          ocr: null,
          error: null,
          r2Key: null,
        });
      });
      return next;
    });
  }, []);

  function onPickFiles(e) { addFiles(e.target.files); e.target.value = ""; }

  function onDrop(e) {
    e.preventDefault(); e.stopPropagation();
    setDropActive(false);
    addFiles(e.dataTransfer?.files);
  }
  function onDragOver(e) { e.preventDefault(); e.stopPropagation(); setDropActive(true); }
  function onDragLeave(e) { e.preventDefault(); e.stopPropagation(); setDropActive(false); }

  function removeItem(id) {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function setItemType(id, type) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, type, ocr: null, status: "ready" } : p)));
  }

  function setItemCrop(id, crop) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, crop } : p)));
  }

  /* ---- 크롭 적용 후 OCR ---- */
  async function processItem(id) {
    const item = items.find((p) => p.id === id);
    if (!item) return;
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "ocr", error: null } : p)));
    try {
      const blob = await cropToBlob(item);
      const croppedFile = new File([blob], item.file.name, { type: blob.type || "image/png" });
      // R2 업로드 — 원본 audit + R2Key 보관
      let r2Key = item.r2Key;
      if (!r2Key) {
        try {
          const up = await uploadFile(item.file, { purpose: "dnf_capture" });
          r2Key = up.r2Key;
        } catch { /* upload 실패해도 OCR 자체는 진행 */ }
      }
      const ocrResp = await auth.ocrDnfProfile({ type: item.type, file: croppedFile });
      const ocr = ocrResp?.result ?? ocrResp;
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "done", ocr, r2Key } : p)));
      applyOcrToResult(item.type, ocr);
    } catch (err) {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error", error: err } : p)));
    }
  }

  function applyOcrToResult(type, ocr) {
    if (!ocr) return;
    if (type === "basic_info") {
      setAdventurerName((v) => ocr.adventurerName || v);
      setMainCharacterName((v) => ocr.mainCharacterName || v);
    } else if (type === "character_list") {
      const names = ocr.characterNames || [];
      setCharacterChips((prev) => mergeCharacters(prev, names.map((n) => ({ name: n }))));
    } else if (type === "character_select") {
      const chars = ocr.characters || [];
      setCharacterChips((prev) => mergeCharacters(prev, chars));
    }
  }

  function addCharacterChip() {
    const name = newCharInput.trim();
    if (!name) return;
    const klass = newCharKlass.trim();
    setCharacterChips((prev) => mergeCharacters(prev, [{ name, klass }]));
    setNewCharInput("");
    setNewCharKlass("");
  }

  function removeChip(name) {
    setCharacterChips((prev) => prev.filter((c) => c.name !== name));
  }

  function setChipKlass(name, klass) {
    setCharacterChips((prev) => prev.map((c) => (c.name === name ? { ...c, klass } : c)));
  }

  function setChipName(oldName, newName) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setCharacterChips((prev) => {
      if (prev.some((c) => c.name === trimmed)) {
        // 같은 이름 있으면 단순 rename 무시 (merge 효과는 다음 OCR 때 처리)
        return prev.filter((c) => c.name !== oldName);
      }
      return prev.map((c) => (c.name === oldName ? { ...c, name: trimmed } : c));
    });
  }

  /* ---- 일괄 OCR ---- */
  async function processAll() {
    for (const it of items) {
      if (it.status === "done") continue;
      // 순차 처리 — Gemini rate 보호 + 사용자 진행 가시성
      // eslint-disable-next-line no-await-in-loop
      await processItem(it.id);
    }
  }

  /* ---- 확정 ---- */
  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const listFromList = items.find((p) => p.type === "character_list")?.ocr?.characterNames || [];
      const selectChars = items.find((p) => p.type === "character_select")?.ocr?.characters || [];
      const fullCharacters = characterChips
        .map((c) => ({ name: c.name, klass: c.klass || selectChars.find((s) => s.name === c.name)?.klass || "" }))
        .filter((c) => c.name);
      const captureR2Keys = {
        basicInfo: items.find((p) => p.type === "basic_info")?.r2Key || undefined,
        characterList: items.find((p) => p.type === "character_list")?.r2Key || undefined,
        characterSelect: items.find((p) => p.type === "character_select")?.r2Key || undefined,
      };
      if (!adventurerName.trim() || !mainCharacterName.trim()) {
        throw new ApiError({ status: 0, code: "validation", message: "모험단명 + 대표 캐릭터명은 필수입니다." });
      }
      const payload = {
        adventurerName: adventurerName.trim(),
        mainCharacterName: mainCharacterName.trim(),
        characters: fullCharacters.filter((c) => c.klass).length > 0
          ? fullCharacters.filter((c) => c.klass)
          : undefined,
        characterListNames: listFromList.length > 0 ? listFromList : undefined,
        characterSelectNames: selectChars.length > 0 ? selectChars.map((c) => c.name) : undefined,
        captureR2Keys,
      };
      await onConfirm?.(payload);
    } catch (err) {
      setConfirmError(err);
    } finally {
      setConfirming(false);
    }
  }

  const pendingCount = items.filter((p) => p.status === "ready" || p.status === "error").length;

  return (
    <div className="form-block">
      <div className="form-step">Step 2 — 던파 캡처 인증</div>
      <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
        던파 모바일 캡처를 <strong>한 칸에 다 드래그-드롭</strong>하세요. 자동으로 화면 종류가
        배정되고, 칩을 눌러 종류를 바꿀 수 있어요. 각 이미지에서 박스를 드래그해 인식할 영역을
        잘라낼 수 있습니다 — 잘라낸 부분만 OCR로 보냅니다. 캡처가 어려우면 텍스트만 입력해도 가입 가능.
      </p>

      {/* 드롭존 */}
      <label
        className={`dnf-drop${dropActive ? " is-active" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickFiles}
          style={{ display: "none" }}
        />
        <span className="dnf-drop__icon" aria-hidden="true">🖼️</span>
        <strong>여기에 캡처를 드래그하거나 클릭해서 선택</strong>
        <small>한 번에 여러 장 OK · 자동으로 모험단 / 캐릭목록 / 캐릭선택으로 분류됨</small>
      </label>

      {items.length > 0 && (
        <>
          <div className="dnf-items">
            {items.map((it) => (
              <DnfItemCard
                key={it.id}
                item={it}
                onTypeChange={(t) => setItemType(it.id, t)}
                onCropChange={(c) => setItemCrop(it.id, c)}
                onRemove={() => removeItem(it.id)}
                onProcess={() => processItem(it.id)}
              />
            ))}
          </div>

          <div className="dnf-batch-row">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={processAll}
              disabled={pendingCount === 0}
            >
              {pendingCount > 0 ? `자동 추출 ${pendingCount}장` : "모두 추출됨"}
            </button>
            <small style={{ color: "var(--muted)" }}>
              종류·영역을 확인하고 위 버튼을 누르세요.
            </small>
          </div>
        </>
      )}

      <div className="form-divider" />
      <div className="form-step">추출 결과 (수정 가능)</div>

      <div className="form-row">
        <label htmlFor="dnf-adv">모험단명 *</label>
        <input
          id="dnf-adv"
          className="form-input"
          type="text"
          value={adventurerName}
          onChange={(e) => setAdventurerName(e.target.value)}
          placeholder="예) 광기의 파도"
        />
      </div>
      <div className="form-row">
        <label htmlFor="dnf-char">대표 캐릭터명 *</label>
        <input
          id="dnf-char"
          className="form-input"
          type="text"
          value={mainCharacterName}
          onChange={(e) => setMainCharacterName(e.target.value)}
          placeholder="예) 지금간다"
        />
      </div>

      <div className="form-row">
        <label>캐릭터 목록</label>
        <div className="chip-grid">
          {characterChips.length === 0 && (
            <small style={{ color: "var(--muted)" }}>
              아직 추출된 캐릭터가 없어요. 캡처를 추출하거나 아래 칸에 직접 추가하세요.
            </small>
          )}
          {characterChips.map((c) => (
            <span key={c.name} className="char-chip">
              <input
                className="char-chip__name"
                value={c.name}
                onChange={(e) => setChipName(c.name, e.target.value)}
                aria-label={`${c.name} 캐릭터명`}
              />
              <input
                className="char-chip__klass"
                list={KLASS_DATALIST_ID}
                value={c.klass || ""}
                placeholder="직업"
                onChange={(e) => setChipKlass(c.name, e.target.value)}
                aria-label={`${c.name} 직업`}
              />
              <button
                type="button"
                aria-label={`${c.name} 제거`}
                className="char-chip__x"
                onClick={() => removeChip(c.name)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="char-add-row">
          <input
            className="form-input"
            type="text"
            placeholder="캐릭명"
            value={newCharInput}
            onChange={(e) => setNewCharInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addCharacterChip(); }
            }}
            aria-label="새 캐릭터명"
          />
          <input
            className="form-input char-add-row__klass"
            type="text"
            list={KLASS_DATALIST_ID}
            placeholder="직업 (선택)"
            value={newCharKlass}
            onChange={(e) => setNewCharKlass(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addCharacterChip(); }
            }}
            aria-label="새 캐릭터 직업"
          />
          <button type="button" className="btn btn-sm" onClick={addCharacterChip}>
            추가
          </button>
        </div>
        <datalist id={KLASS_DATALIST_ID}>
          {DNF_BASE_CLASSES_UNIQUE.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>
      </div>

      {confirmError && (
        <div className="callout-box is-pending">
          <strong>가입 실패</strong>
          {confirmError.message || "다시 시도해 주세요."}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={confirming}
      >
        {confirming ? (busyText || "가입 처리중…") : "가입 완료"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── 아이템 카드 (썸 + crop) */

function DnfItemCard({ item, onTypeChange, onCropChange, onRemove, onProcess }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  function pointerNorm(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height),
    };
  }

  function onPointerDown(e, mode) {
    e.preventDefault(); e.stopPropagation();
    const start = pointerNorm(e);
    dragRef.current = { mode, start, startCrop: { ...item.crop } };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current) return;
    const p = pointerNorm(e);
    const dx = p.x - dragRef.current.start.x;
    const dy = p.y - dragRef.current.start.y;
    onCropChange(computeNextCrop(dragRef.current.mode, dragRef.current.startCrop, dx, dy));
  }
  function onPointerUp(e) {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
  }

  const crop = item.crop;
  const cropStyle = {
    left: `${crop.x * 100}%`,
    top: `${crop.y * 100}%`,
    width: `${crop.w * 100}%`,
    height: `${crop.h * 100}%`,
  };

  const statusLabel = {
    ready: "준비됨",
    ocr: "OCR 중…",
    done: "완료",
    error: "실패",
  }[item.status] || item.status;

  return (
    <article className={`dnf-item dnf-item--${item.status}`}>
      <div
        ref={canvasRef}
        className="dnf-item__canvas"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.previewUrl} alt="" className="dnf-item__img" draggable={false} />
        <div
          className="dnf-item__crop"
          style={cropStyle}
          onPointerDown={(e) => onPointerDown(e, "move")}
        >
          <span className="dnf-item__handle is-tl" onPointerDown={(e) => onPointerDown(e, "tl")} />
          <span className="dnf-item__handle is-tr" onPointerDown={(e) => onPointerDown(e, "tr")} />
          <span className="dnf-item__handle is-bl" onPointerDown={(e) => onPointerDown(e, "bl")} />
          <span className="dnf-item__handle is-br" onPointerDown={(e) => onPointerDown(e, "br")} />
        </div>
      </div>

      <div className="dnf-item__body">
        <div className="dnf-item__type-row" role="group" aria-label="화면 종류">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`dnf-type-chip${item.type === t.key ? " is-active" : ""}`}
              onClick={() => onTypeChange(t.key)}
              title={t.note}
            >
              <span aria-hidden="true">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
        <div className="dnf-item__status">
          <span className="dnf-item__status-text">
            {statusLabel} · {TYPE_BY_KEY[item.type]?.label}
          </span>
          {item.error && (
            <small style={{ color: "var(--danger)" }}>
              {item.error.message || "OCR 실패"}
            </small>
          )}
          {item.ocr && item.type === "basic_info" && (
            <small>
              → {item.ocr.adventurerName || "?"} / {item.ocr.mainCharacterName || "?"}
            </small>
          )}
          {item.ocr && item.type === "character_list" && (
            <small>→ 캐릭 {item.ocr.characterNames?.length || 0}명 인식</small>
          )}
          {item.ocr && item.type === "character_select" && (
            <small>→ 캐릭+직업 {item.ocr.characters?.length || 0}쌍 인식</small>
          )}
        </div>
        <div className="dnf-item__actions">
          <button type="button" className="btn btn-sm" onClick={onProcess} disabled={item.status === "ocr"}>
            {item.status === "ocr" ? "OCR 중…" : item.status === "done" ? "다시 추출" : "추출"}
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onRemove}>
            제거
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────── crop 계산 */

function computeNextCrop(mode, start, dx, dy) {
  let { x, y, w, h } = start;
  if (mode === "move") {
    x = clamp01(x + dx);
    y = clamp01(y + dy);
    if (x + w > 1) x = 1 - w;
    if (y + h > 1) y = 1 - h;
    return { x, y, w, h };
  }
  let nx = x, ny = y, nw = w, nh = h;
  if (mode === "tl") { nx = x + dx; ny = y + dy; nw = w - dx; nh = h - dy; }
  if (mode === "tr") { ny = y + dy; nw = w + dx; nh = h - dy; }
  if (mode === "bl") { nx = x + dx; nw = w - dx; nh = h + dy; }
  if (mode === "br") { nw = w + dx; nh = h + dy; }
  if (nw < MIN_SIZE) { if (mode === "tl" || mode === "bl") nx = x + (w - MIN_SIZE); nw = MIN_SIZE; }
  if (nh < MIN_SIZE) { if (mode === "tl" || mode === "tr") ny = y + (h - MIN_SIZE); nh = MIN_SIZE; }
  if (nx < 0) { nw += nx; nx = 0; }
  if (ny < 0) { nh += ny; ny = 0; }
  if (nx + nw > 1) nw = 1 - nx;
  if (ny + nh > 1) nh = 1 - ny;
  if (nw < MIN_SIZE) nw = MIN_SIZE;
  if (nh < MIN_SIZE) nh = MIN_SIZE;
  return { x: nx, y: ny, w: nw, h: nh };
}

/* ─────────────────────────────────────────────────────────── 이미지 → 크롭 Blob */

function cropToBlob(item) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = item.crop;
      const sx = Math.round(img.naturalWidth * c.x);
      const sy = Math.round(img.naturalHeight * c.y);
      const sw = Math.max(1, Math.round(img.naturalWidth * c.w));
      const sh = Math.max(1, Math.round(img.naturalHeight * c.h));
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("이미지 크롭 실패"));
        else resolve(blob);
      }, "image/jpeg", 0.92);
    };
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = item.previewUrl;
  });
}

/* ─────────────────────────────────────────────────────────── 캐릭 중복 merge */

function mergeCharacters(prev, incoming) {
  const map = new Map();
  for (const c of prev) map.set(c.name, c);
  for (const c of incoming) {
    if (!c?.name) continue;
    const existing = map.get(c.name);
    if (existing) {
      // 기존 klass 가 없고 새로 들어오면 보강
      map.set(c.name, { ...existing, klass: existing.klass || c.klass });
    } else {
      map.set(c.name, { name: c.name, klass: c.klass || "" });
    }
  }
  return Array.from(map.values());
}
