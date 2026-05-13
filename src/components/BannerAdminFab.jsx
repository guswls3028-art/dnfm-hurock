"use client";

/**
 * BannerAdminFab — 우상단 톱니바퀴 (어드민 전용) → 우측 drawer slide-in.
 *
 * 카톡 요구사항 (2026-05-13 새벽, 허락공대 멤버 ↔ 방장):
 *   "저거 배너뜨는거 글 바꿀수있나요"
 *   "이미지로 올린건데 배너 품목 스스로 수정가능하게하겠음 이미지로"
 *
 * → 허락님(어드민) 이 hero 배너(wide kind) 이미지/문구/링크를 직접 추가·교체·삭제.
 * T2 (학원 SaaS) LandingInlineEditorFab.tsx 패턴 차용 — 권한 게이트, drawer slide-in,
 * 6 slot grid, file picker, R2 multipart 업로드, live preview, 저장 + 페이지 reload.
 *
 * - 비어드민/비로그인 시 null (시각 노이즈 0)
 * - hero portrait 슬라이드(허락 본인 프사) 는 코드 고정 — 사이트 identity 라 admin 편집 영역 아님
 * - wide kind 슬라이드만 본 fab 에서 관리. backend `hero_banners` 도메인.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, heroBanners as bannersApi, uploads } from "@/lib/api-client";
import { useCurrentUser, isAdmin } from "@/lib/use-current-user";

const SITE = "allow";
const MAX_SLOTS = 6;
const MAX_FILE_MB = 5;

const cardBorder = "rgba(255,255,255,0.08)";
const inputBg = "rgba(255,255,255,0.04)";

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#9CA3AF",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  margin: "0 0 6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  background: inputBg,
  border: `1px solid ${cardBorder}`,
  color: "#F5F1E8",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};

export default function BannerAdminFab({ onChanged }) {
  const { user } = useCurrentUser();
  const owner = isAdmin(user, SITE);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!owner) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="배너 편집 (운영자)"
        title="배너 편집 (운영자 전용)"
        data-testid="banner-admin-fab"
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 40,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1px solid rgba(212,160,76,0.5)",
          color: "#D4A04C",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 10px 28px rgba(0,0,0,0.32), 0 0 0 1px rgba(212,160,76,0.15)",
          transition: "transform 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && <Drawer onClose={() => setOpen(false)} onChanged={onChanged} />}
    </>
  );
}

function Drawer({ onClose, onChanged }) {
  const [banners, setBanners] = useState([]); // [{id, imageUrl, linkUrl, label, sortOrder, active}]
  const [loading, setLoading] = useState(true);
  const [savingIdx, setSavingIdx] = useState(null); // index 단위 saving state
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [err, setErr] = useState(null);
  const fileInputs = useRef([]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await bannersApi.list({ includeInactive: true });
      const items = Array.isArray(res?.items) ? res.items : [];
      // sortOrder asc + createdAt fallback
      items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setBanners(items);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleUploadSlot = async (idx, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErr(`${MAX_FILE_MB}MB 이하 이미지만 업로드 가능합니다.`);
      return;
    }
    setUploadingIdx(idx);
    setErr(null);
    try {
      const res = await uploads.file({ purpose: "hero_banner", file });
      // backend 응답: { upload: {...}, url } 또는 { upload: { r2Key, ... } } — 둘 다 처리
      const url = res?.url || res?.upload?.url || res?.upload?.publicUrl;
      const r2Key = res?.upload?.r2Key || res?.r2Key;
      const imageUrl = url || (r2Key ? `/uploads/r2/${r2Key}` : null);
      if (!imageUrl) {
        throw new Error("업로드 응답에 url 이 없습니다.");
      }
      const existing = banners[idx];
      if (existing?.id) {
        // 기존 슬롯 이미지 교체 → PATCH
        const updated = await bannersApi.update(existing.id, { imageUrl });
        const next = banners.slice();
        next[idx] = updated?.banner || { ...existing, imageUrl };
        setBanners(next);
      } else {
        // 신규 슬롯 → POST (label/linkUrl 은 빈 값으로 시작, 사용자가 이후 입력)
        const created = await bannersApi.create({
          imageUrl,
          linkUrl: null,
          label: null,
          sortOrder: idx,
          active: true,
        });
        const next = banners.slice();
        next[idx] = created?.banner || {
          id: null,
          imageUrl,
          linkUrl: null,
          label: null,
          sortOrder: idx,
          active: true,
        };
        setBanners(next);
      }
      onChanged?.();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : e.message || "업로드 실패");
    } finally {
      setUploadingIdx(null);
    }
  };

  const patchField = async (idx, partial) => {
    const existing = banners[idx];
    if (!existing?.id) {
      // 아직 backend row 없음 — 로컬 state 만 갱신, 이미지 업로드 시 함께 POST
      const next = banners.slice();
      next[idx] = { ...existing, ...partial };
      setBanners(next);
      return;
    }
    setSavingIdx(idx);
    setErr(null);
    try {
      const res = await bannersApi.update(existing.id, partial);
      const next = banners.slice();
      next[idx] = res?.banner || { ...existing, ...partial };
      setBanners(next);
      onChanged?.();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "저장 실패");
    } finally {
      setSavingIdx(null);
    }
  };

  const handleDelete = async (idx) => {
    const existing = banners[idx];
    if (!existing?.id) {
      // 로컬만 — 즉 제거
      setBanners(banners.filter((_, i) => i !== idx));
      return;
    }
    if (!window.confirm("이 배너를 삭제할까요? 되돌릴 수 없습니다.")) return;
    setSavingIdx(idx);
    setErr(null);
    try {
      await bannersApi.remove(existing.id);
      setBanners(banners.filter((_, i) => i !== idx));
      onChanged?.();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "삭제 실패");
    } finally {
      setSavingIdx(null);
    }
  };

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => banners[i] || null);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(8,12,22,0.6)",
        backdropFilter: "blur(6px)",
        animation: "bannerEditorFade 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="배너 편집"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(460px, 92vw)",
          background: "#0F1525",
          borderLeft: `1px solid ${cardBorder}`,
          padding: 24,
          overflowY: "auto",
          color: "#F5F1E8",
          fontFamily:
            "'Pretendard Variable', 'Pretendard', system-ui, sans-serif",
          animation: "bannerEditorSlideIn 0.22s cubic-bezier(.2,.7,.2,1)",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.5)",
        }}
      >
        <style>{`
          @keyframes bannerEditorFade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes bannerEditorSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        `}</style>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: `1px solid ${cardBorder}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#D4A04C",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Owner Console
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              배너 편집
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "transparent",
              border: `1px solid ${cardBorder}`,
              color: "#9CA3AF",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            margin: "0 0 16px",
            lineHeight: 1.6,
          }}
        >
          최상단 슬라이드 배너 (가로형) 를 슬롯별로 추가·교체·삭제합니다.
          이미지 1장당 5MB 이하 PNG/JPG/WEBP. 가로 비율 4:1 권장.
        </p>

        {err && (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(220, 38, 38, 0.12)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              color: "#FCA5A5",
              fontSize: 12,
            }}
          >
            {err}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#9CA3AF", fontSize: 13 }}>불러오는 중…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {slots.map((banner, idx) => (
              <SlotCard
                key={banner?.id || `empty-${idx}`}
                idx={idx}
                banner={banner}
                uploading={uploadingIdx === idx}
                saving={savingIdx === idx}
                fileInputRef={(el) => {
                  fileInputs.current[idx] = el;
                }}
                onPickFile={(file) => handleUploadSlot(idx, file)}
                onPatch={(partial) => patchField(idx, partial)}
                onDelete={() => handleDelete(idx)}
              />
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${cardBorder}`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 18px",
              background: "linear-gradient(135deg, #D4A04C 0%, #B8862F 100%)",
              color: "#0A0E1A",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 22px rgba(212,160,76,0.32)",
            }}
          >
            닫기
          </button>
          <p
            style={{
              fontSize: 11,
              color: "#6B7280",
              margin: "12px 0 0",
              lineHeight: 1.6,
            }}
          >
            업로드·문구·링크·표시여부 모두 저장 즉시 라이브에 반영됩니다.
            허락 본인 프로필 슬라이드는 코드 고정이라 여기서는 안 보입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function SlotCard({
  idx,
  banner,
  uploading,
  saving,
  fileInputRef,
  onPickFile,
  onPatch,
  onDelete,
}) {
  const [label, setLabel] = useState(banner?.label || "");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || "");

  // backend row 갱신되면 local input 동기화 (외부 변경 흡수)
  useEffect(() => {
    setLabel(banner?.label || "");
    setLinkUrl(banner?.linkUrl || "");
  }, [banner?.id, banner?.label, banner?.linkUrl]);

  const hasImage = !!banner?.imageUrl;
  const active = banner?.active !== false;

  const commitLabel = () => {
    if ((banner?.label || "") === label) return;
    onPatch({ label: label.trim() || null });
  };
  const commitLink = () => {
    if ((banner?.linkUrl || "") === linkUrl) return;
    onPatch({ linkUrl: linkUrl.trim() || null });
  };

  return (
    <div
      style={{
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 10,
        padding: 12,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>
          슬롯 {idx + 1}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {hasImage && banner?.id && (
            <label
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                display: "inline-flex",
                gap: 4,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => onPatch({ active: e.target.checked })}
                disabled={saving}
              />
              표시
            </label>
          )}
          {hasImage && (
            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              aria-label="삭제"
              title="삭제"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(220,38,38,0.18)",
                border: "1px solid rgba(220,38,38,0.4)",
                color: "#FCA5A5",
                fontSize: 12,
                fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          aspectRatio: "4 / 1",
          borderRadius: 8,
          overflow: "hidden",
          background: hasImage ? "transparent" : inputBg,
          border: `1px dashed ${hasImage ? "transparent" : cardBorder}`,
          position: "relative",
          marginBottom: 10,
          opacity: active ? 1 : 0.4,
        }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.imageUrl}
            alt={label || `슬롯 ${idx + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            이미지를 업로드하세요
          </div>
        )}
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            업로드 중…
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          onChange={(e) => onPickFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={(e) => {
            // file input 클릭
            const input = e.currentTarget.previousSibling;
            if (input && input.click) input.click();
          }}
          disabled={uploading || saving}
          aria-label={hasImage ? "이미지 교체" : "이미지 업로드"}
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
            border: "none",
            cursor: uploading || saving ? "wait" : "pointer",
          }}
        />
      </div>

      <p style={labelStyle}>문구 (선택)</p>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={commitLabel}
        placeholder="예: 아바타 콘테스트 1회"
        maxLength={80}
        disabled={!hasImage || saving}
        style={{ ...inputStyle, marginBottom: 8 }}
      />

      <p style={labelStyle}>링크 URL (선택)</p>
      <input
        type="text"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        onBlur={commitLink}
        placeholder="https://… 또는 /contests/c-…"
        disabled={!hasImage || saving}
        style={inputStyle}
      />
    </div>
  );
}
