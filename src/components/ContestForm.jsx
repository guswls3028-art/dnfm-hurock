"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, contests as contestsApi } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload";
import PhotoField from "@/components/PhotoField";

/**
 * ContestForm — 콘테스트 참가 양식 (form_schema 기반).
 *
 * field types:
 *   - default: text input
 *   - textarea
 *   - file (R2 presigned PUT 으로 업로드 → publicUrl 을 값으로 저장)
 *
 * dnfProfile 이 있으면 prefillFrom 으로 자동 채움. 비회원이면 빈 form + 닉/비번 입력.
 *
 * 비회원 정책 SSOT: project_anonymous_posting_policy.md (2026-05-14).
 *   - isGuest=true 면 guestNickname/guestPassword 입력 받음.
 *   - 비번 입력하면 backend 가 bcrypt 해시 저장 → 추후 본인 삭제 가능.
 *   - 비번 비우면 작성은 가능하나 수정/삭제 불가 (디시 스타일).
 *
 * submit:
 *   POST /sites/hurock/contests/:id/entries  body={fields, guestNickname?, guestPassword?}
 *   성공 시 redirect: /contests/:id
 */
export default function ContestForm({ contestId, schema = [], dnfProfile, isGuest = false }) {
  const router = useRouter();
  const [values, setValues] = useState(() => initialValues(schema, dnfProfile));
  const [uploads, setUploads] = useState({}); // { [key]: { uploading, url, error } }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [guestNickname, setGuestNickname] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const initRef = useRef(false);

  // dnfProfile 이 늦게 도착하는 경우 한 번 더 prefill
  useEffect(() => {
    if (initRef.current) return;
    if (!dnfProfile) return;
    initRef.current = true;
    setValues((prev) => ({ ...initialValues(schema, dnfProfile), ...prev }));
  }, [dnfProfile, schema]);

  function setField(key, val) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleFile(key, file) {
    if (!file) return;
    setUploads((u) => ({ ...u, [key]: { uploading: true, r2Key: null, error: null, filename: file.name } }));
    try {
      const { r2Key } = await uploadFile(file, { purpose: "contest_entry" });
      setUploads((u) => ({ ...u, [key]: { uploading: false, r2Key, error: null, filename: file.name } }));
      setField(key, r2Key);
    } catch (err) {
      setUploads((u) => ({ ...u, [key]: { uploading: false, r2Key: null, error: err, filename: file.name } }));
    }
  }

  function isFieldVisible(field) {
    if (!field.showWhen) return true;
    const { field: depKey, in: allowed, equals } = field.showWhen;
    const depVal = values[depKey];
    if (Array.isArray(allowed)) return allowed.includes(depVal);
    if (typeof equals !== "undefined") return depVal === equals;
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // 필수 필드 검증 (보이는 필드만)
      for (const field of schema) {
        if (!isFieldVisible(field)) continue;
        if (!field.required) continue;
        const v = values[field.key];
        const empty =
          v == null ||
          v === "" ||
          (typeof v === "object" && !v?.r2Key);
        if (empty) {
          throw new ApiError({
            status: 0,
            code: "validation",
            message: `[${field.label}] 은(는) 필수입니다.`,
          });
        }
      }
      // 비회원이면 닉/비번 같이 전송. 회원이면 fields 만 (backend optionalAuth 가 userId 박음).
      const payload = { fields: values };
      if (isGuest) {
        const nick = guestNickname.trim();
        if (nick) payload.guestNickname = nick;
        if (guestPassword) {
          // backend dto: min(4). client 도 사전 검증.
          if (guestPassword.length < 4) {
            throw new ApiError({
              status: 0,
              code: "validation",
              message: "비밀번호는 4자 이상이어야 합니다 (비울 거면 완전히 비워주세요).",
            });
          }
          payload.guestPassword = guestPassword;
        }
      }
      await contestsApi.entries.create(contestId, payload);
      setSuccess(true);
      // 잠깐 표시 후 리스트로
      setTimeout(() => {
        router.push(`/contests/${contestId}`);
        router.refresh();
      }, 600);
    } catch (err) {
      if (err instanceof ApiError) setError(err);
      else setError({ message: err?.message || "제출 실패" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-block" onSubmit={handleSubmit} aria-label="콘테스트 참가 폼">
      <div className="form-step">참가 양식</div>
      {schema.map((field) => {
        if (!isFieldVisible(field)) return null;
        const id = `field-${field.key}`;
        const v = values[field.key];
        const up = uploads[field.key];
        if (field.type === "photo") {
          return (
            <PhotoField
              key={field.key}
              field={field}
              value={v}
              onChange={(next) => setField(field.key, next)}
              purpose="contest_entry"
            />
          );
        }
        if (field.type === "textarea") {
          return (
            <div className="form-row" key={field.key}>
              <label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <textarea
                id={id}
                className="form-textarea"
                placeholder={field.placeholder || ""}
                value={v || ""}
                onChange={(e) => setField(field.key, e.target.value)}
              />
              {field.prefillFrom && (
                <small>내 페이지의 던파 프로필에서 자동 채움: {field.prefillFrom}</small>
              )}
            </div>
          );
        }
        if (field.type === "select-or-input") {
          const opts = resolvePath(dnfProfile ? { dnfProfile } : {}, field.optionsFrom);
          const optionList = Array.isArray(opts)
            ? opts
                .map((o) => (typeof o === "string" ? o : o?.[field.optionLabelKey || "name"]))
                .filter(Boolean)
            : [];
          const FREEFORM = "__freeform__";
          const isFreeform = v && !optionList.includes(v);
          const selectVal = isFreeform ? FREEFORM : v || "";
          return (
            <div className="form-row" key={field.key}>
              <label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              {optionList.length > 0 ? (
                <>
                  <select
                    id={id}
                    className="form-input"
                    value={selectVal}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === FREEFORM) setField(field.key, "");
                      else setField(field.key, next);
                    }}
                  >
                    <option value="">선택하세요</option>
                    {optionList.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                    <option value={FREEFORM}>+ 직접 입력</option>
                  </select>
                  {(isFreeform || selectVal === FREEFORM) && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="직접 입력"
                      value={v || ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                    />
                  )}
                </>
              ) : (
                <input
                  id={id}
                  type="text"
                  className="form-input"
                  placeholder={field.placeholder || ""}
                  value={v || ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              )}
              {field.help && <small style={{ color: "var(--muted)" }}>{field.help}</small>}
            </div>
          );
        }
        if (field.type === "select") {
          const opts = Array.isArray(field.options) ? field.options : [];
          return (
            <div className="form-row" key={field.key}>
              <label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <select
                id={id}
                className="form-input"
                value={v || ""}
                onChange={(e) => setField(field.key, e.target.value)}
              >
                <option value="">선택하세요</option>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        if (field.type === "file") {
          return (
            <div className="form-row" key={field.key}>
              <label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <input
                id={id}
                type="file"
                accept={field.accept || "image/*"}
                onChange={(e) => handleFile(field.key, e.target.files?.[0])}
                className="form-input"
              />
              {up?.uploading && <small>업로드 중… ({up.filename})</small>}
              {up?.r2Key && (
                <small style={{ color: "var(--primary-ink)" }}>
                  ✓ 업로드 완료
                </small>
              )}
              {up?.error && (
                <small style={{ color: "var(--danger)" }}>
                  업로드 실패: {up.error.message || "재시도 해주세요"}
                </small>
              )}
            </div>
          );
        }
        return (
          <div className="form-row" key={field.key}>
            <label htmlFor={id}>
              {field.label}
              {field.required ? " *" : ""}
            </label>
            <input
              id={id}
              type="text"
              className="form-input"
              placeholder={field.placeholder || ""}
              value={v || ""}
              onChange={(e) => setField(field.key, e.target.value)}
            />
            {field.prefillFrom && (
              <small>내 페이지의 던파 프로필에서 자동 채움: {field.prefillFrom}</small>
            )}
          </div>
        );
      })}

      {isGuest && (
        <>
          <div className="form-divider" />
          <div className="form-step">비회원 정보 (선택)</div>
          <div className="form-row">
            <label htmlFor="guest-nick">닉네임</label>
            <input
              id="guest-nick"
              type="text"
              className="form-input"
              placeholder="비우면 'ㅇㅇ(IP끝자리)' 로 표시"
              value={guestNickname}
              onChange={(e) => setGuestNickname(e.target.value)}
              maxLength={32}
            />
          </div>
          <div className="form-row">
            <label htmlFor="guest-pw">비밀번호 (수정/삭제용)</label>
            <input
              id="guest-pw"
              type="password"
              className="form-input"
              placeholder="비우면 작성은 가능하나 수정/삭제 불가"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              minLength={4}
              maxLength={128}
              autoComplete="new-password"
            />
            <small style={{ color: "var(--muted)" }}>
              4자 이상. 디시 스타일 — 같은 비번 입력 시 본인 인증.
            </small>
          </div>
        </>
      )}

      {error && (
        <div className="callout-box is-pending">
          <strong>제출 실패</strong>
          {error.message || "다시 시도해 주세요."}
        </div>
      )}
      {success && (
        <div className="callout-box">
          <strong>제출 완료</strong>
          참가작이 검수 대기로 등록되었습니다. 운영자 승인 후 공개됩니다.
        </div>
      )}

      <div className="form-divider" />
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "제출 중…" : "참가 제출"}
      </button>
    </form>
  );
}

function resolvePath(obj, path) {
  if (!path || !obj) return undefined;
  const segs = path.split(".");
  let cur = obj;
  for (const s of segs) cur = cur?.[s];
  return cur;
}

function initialValues(schema, dnfProfile) {
  const v = {};
  for (const field of schema) {
    if (field.prefillFrom && dnfProfile) {
      const segs = field.prefillFrom.split(".");
      let cur = { dnfProfile };
      for (const s of segs) cur = cur?.[s];
      v[field.key] = cur ?? "";
    } else {
      v[field.key] = "";
    }
  }
  return v;
}
