"use client";

import { useState } from "react";
import { ApiError, auth } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload";

/**
 * DnfProfileForm — 가입 2단계.
 *
 * 사용자가 모험단/캐릭터/장비 캡처 3장을 업로드 →
 *   1) R2 presigned PUT 으로 업로드
 *   2) /auth/dnf-profile/ocr/:type 호출 → 추출 결과
 *   3) 누적 결과를 사용자에게 보여주고, "다음" 클릭 시 onConfirm({ adventureName, characterName, ... })
 *
 * backend 미연결/네트워크 실패 시 사용자가 직접 텍스트 입력하도록 fallback UI 노출.
 */

const SLOTS = [
  {
    key: "adventure",
    label: "① 모험단 캡처",
    hint: "모험단명/소속 캐릭터가 보이는 캡처",
  },
  {
    key: "character",
    label: "② 캐릭터 정보 캡처",
    hint: "캐릭터명/직업/서버가 보이는 캡처",
  },
  {
    key: "equipment",
    label: "③ 장비 캡처",
    hint: "현재 장착 장비 일람",
  },
];

export default function DnfProfileForm({ onConfirm, busyText }) {
  const [slots, setSlots] = useState({}); // { [key]: { file, uploading, url, ocr, error } }
  const [manual, setManual] = useState({
    adventureName: "",
    characterName: "",
    serverName: "",
  });
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  async function handleFile(slotKey, file) {
    if (!file) return;
    setSlots((prev) => ({
      ...prev,
      [slotKey]: { file, uploading: true, url: null, ocr: null, error: null },
    }));
    try {
      const url = await uploadFile(file, { scope: `signup-${slotKey}` });
      setSlots((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], uploading: false, url, ocrLoading: true, error: null },
      }));
      try {
        const ocr = await auth.ocrDnfProfile({ type: slotKey, fileUrl: url });
        setSlots((prev) => ({
          ...prev,
          [slotKey]: { ...prev[slotKey], ocrLoading: false, ocr, error: null },
        }));
        // OCR 결과로 manual 자동 채움
        if (ocr) {
          setManual((m) => ({
            adventureName: ocr.adventureName || m.adventureName,
            characterName: ocr.characterName || m.characterName,
            serverName: ocr.serverName || m.serverName,
          }));
        }
      } catch (err) {
        setSlots((prev) => ({
          ...prev,
          [slotKey]: { ...prev[slotKey], ocrLoading: false, error: err },
        }));
      }
    } catch (err) {
      setSlots((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], uploading: false, error: err },
      }));
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const payload = {
        adventureName: manual.adventureName.trim(),
        characterName: manual.characterName.trim(),
        serverName: manual.serverName.trim(),
        captures: SLOTS.map((s) => ({
          key: s.key,
          url: slots[s.key]?.url || null,
        })),
      };
      if (!payload.adventureName || !payload.characterName) {
        throw new ApiError({
          status: 0,
          code: "validation",
          message: "모험단명 + 대표 캐릭터명은 필수입니다.",
        });
      }
      await onConfirm?.(payload);
    } catch (err) {
      setConfirmError(err);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="form-block">
      <div className="form-step">Step 2 — 던파 캡처 인증</div>
      <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
        모험단/캐릭터/장비 정보 캡처 3종을 올리면 OCR 로 자동 추출해 프로필을 채웁니다. 추출이
        부정확하면 아래 텍스트 칸에서 직접 수정하세요.
      </p>

      {SLOTS.map((slot) => {
        const state = slots[slot.key];
        return (
          <div className="form-row" key={slot.key}>
            <label htmlFor={`cap-${slot.key}`}>{slot.label}</label>
            <input
              id={`cap-${slot.key}`}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(slot.key, e.target.files?.[0])}
              className="form-input"
            />
            <small>{slot.hint}</small>
            {state?.uploading && <small>업로드 중…</small>}
            {state?.ocrLoading && <small>OCR 인식 중…</small>}
            {state?.url && !state?.error && (
              <small style={{ color: "var(--primary-ink)" }}>
                ✓ 업로드됨 {state.ocr ? "· OCR 완료" : ""}
              </small>
            )}
            {state?.error && (
              <small style={{ color: "var(--danger)" }}>
                실패: {state.error.message || "알 수 없는 오류"} — 아래 텍스트로 직접 입력하셔도 됩니다.
              </small>
            )}
          </div>
        );
      })}

      <div className="form-divider" />
      <div className="form-step">추출 결과 (수정 가능)</div>
      <div className="form-row">
        <label htmlFor="dnf-adv">모험단명 *</label>
        <input
          id="dnf-adv"
          className="form-input"
          type="text"
          value={manual.adventureName}
          onChange={(e) => setManual((m) => ({ ...m, adventureName: e.target.value }))}
          placeholder="예) 허락팬1단"
        />
      </div>
      <div className="form-row">
        <label htmlFor="dnf-char">대표 캐릭터명 *</label>
        <input
          id="dnf-char"
          className="form-input"
          type="text"
          value={manual.characterName}
          onChange={(e) => setManual((m) => ({ ...m, characterName: e.target.value }))}
          placeholder="예) 라피헌터"
        />
      </div>
      <div className="form-row">
        <label htmlFor="dnf-server">서버</label>
        <input
          id="dnf-server"
          className="form-input"
          type="text"
          value={manual.serverName}
          onChange={(e) => setManual((m) => ({ ...m, serverName: e.target.value }))}
          placeholder="예) 안톤"
        />
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
