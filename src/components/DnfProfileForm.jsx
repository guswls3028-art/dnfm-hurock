"use client";

import { useState } from "react";
import { ApiError, auth } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload";

/**
 * DnfProfileForm — 가입 2단계 (allow 사이트).
 *
 * 사용자가 던파 모바일 3종 캡처를 업로드:
 *   1) basic_info        모험단/소속 캐릭 화면 → 모험단명 + 대표 캐릭터명
 *   2) character_list    보유 캐릭터 화면     → 캐릭터 이름 배열
 *   3) character_select  캐릭터 선택 화면     → {name, klass} 배열
 *
 * backend OCR endpoint: POST /auth/dnf-profile/ocr/:type  (multipart, file body)
 * verifiedBySelectScreen 은 backend 가 2 ∩ 3 overlap 으로 계산.
 *
 * 흐름:
 *   파일 선택 → uploadFile(purpose="dnf_capture") → r2Key 보관
 *              → OCR endpoint 호출 (file multipart) → manual 자동 채움
 *   "가입 완료" → onConfirm({ adventurerName, mainCharacterName, characters, captureR2Keys,
 *                              characterListNames, characterSelectNames })
 */

const SLOTS = [
  {
    key: "basic_info",
    label: "① 모험단/대표캐릭 캡처",
    hint: "모험단명·대표 캐릭터가 보이는 화면 (정보 → 모험단 → 기본정보)",
  },
  {
    key: "character_list",
    label: "② 보유 캐릭터 캡처",
    hint: "캐릭터 카드들이 보이는 화면 (정보 → 보유캐릭터)",
  },
  {
    key: "character_select",
    label: "③ 캐릭터 선택 캡처",
    hint: "로그인 직후 캐릭터 선택 화면 (본인 인증용)",
  },
];

export default function DnfProfileForm({ onConfirm, busyText }) {
  const [slots, setSlots] = useState({}); // { [key]: { file, uploading, ocrLoading, r2Key, ocr, error } }
  const [manual, setManual] = useState({
    adventurerName: "",
    mainCharacterName: "",
  });
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  async function handleFile(slotKey, file) {
    if (!file) return;
    setSlots((prev) => ({
      ...prev,
      [slotKey]: { file, uploading: true, ocrLoading: false, r2Key: null, ocr: null, error: null },
    }));

    // 1) R2 업로드 (audit + 추후 재인식 백업)
    let r2Key = null;
    try {
      const result = await uploadFile(file, { purpose: "dnf_capture" });
      r2Key = result.r2Key;
      setSlots((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], uploading: false, ocrLoading: true, r2Key, error: null },
      }));
    } catch (err) {
      setSlots((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], uploading: false, error: err },
      }));
      return;
    }

    // 2) OCR — multipart 으로 file 전송
    try {
      const ocrResp = await auth.ocrDnfProfile({ type: slotKey, file });
      const ocr = ocrResp?.result ?? ocrResp;
      setSlots((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], ocrLoading: false, ocr, error: null },
      }));
      if (ocr) {
        setManual((m) => ({
          adventurerName: ocr.adventurerName || m.adventurerName,
          mainCharacterName: ocr.mainCharacterName || m.mainCharacterName,
        }));
      }
    } catch (err) {
      setSlots((prev) => ({
        ...prev,
        [slotKey]: { ...prev[slotKey], ocrLoading: false, error: err },
      }));
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const characterList = slots.character_list?.ocr?.characterNames || [];
      const characterSelect = slots.character_select?.ocr?.characters || [];
      const payload = {
        adventurerName: manual.adventurerName.trim(),
        mainCharacterName: manual.mainCharacterName.trim(),
        // character_select 의 {name,klass} 가 표준. character_list 는 name 만 있어 klass 빈 채로
        // 보내면 backend min(1) 깨짐 → list 는 별도 names 배열로만 전달.
        characters: characterSelect.length > 0 ? characterSelect : undefined,
        characterListNames: characterList.length > 0 ? characterList : undefined,
        characterSelectNames:
          characterSelect.length > 0 ? characterSelect.map((c) => c.name) : undefined,
        captureR2Keys: {
          basicInfo: slots.basic_info?.r2Key || undefined,
          characterList: slots.character_list?.r2Key || undefined,
          characterSelect: slots.character_select?.r2Key || undefined,
        },
      };
      if (!payload.adventurerName || !payload.mainCharacterName) {
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
        3종 캡처를 올리면 OCR 로 자동 추출해 프로필을 채웁니다. 추출이 부정확하면 아래 텍스트
        칸에서 직접 수정하세요. 캡처가 어려우면 텍스트만 입력해도 가입은 가능합니다.
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
            {state?.r2Key && !state?.error && (
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
          value={manual.adventurerName}
          onChange={(e) => setManual((m) => ({ ...m, adventurerName: e.target.value }))}
          placeholder="예) 허락팬1단"
        />
      </div>
      <div className="form-row">
        <label htmlFor="dnf-char">대표 캐릭터명 *</label>
        <input
          id="dnf-char"
          className="form-input"
          type="text"
          value={manual.mainCharacterName}
          onChange={(e) => setManual((m) => ({ ...m, mainCharacterName: e.target.value }))}
          placeholder="예) 라피헌터"
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
