"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, contests as contestsApi } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload";

/**
 * ContestForm — 콘테스트 참가 양식 (form_schema 기반).
 *
 * field types:
 *   - default: text input
 *   - textarea
 *   - file (R2 presigned PUT 으로 업로드 → publicUrl 을 값으로 저장)
 *
 * dnfProfile 이 있으면 prefillFrom 으로 자동 채움. 비로그인이면 비워둠.
 *
 * submit:
 *   POST /sites/allow/contests/:id/entries  body={fields:{...}}
 *   성공 시 redirect: /contests/:id
 */
export default function ContestForm({ contestId, schema = [], dnfProfile }) {
  const router = useRouter();
  const [values, setValues] = useState(() => initialValues(schema, dnfProfile));
  const [uploads, setUploads] = useState({}); // { [key]: { uploading, url, error } }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
    setUploads((u) => ({ ...u, [key]: { uploading: true, url: null, error: null, filename: file.name } }));
    try {
      const url = await uploadFile(file, { scope: `contest-${contestId}` });
      setUploads((u) => ({ ...u, [key]: { uploading: false, url, error: null, filename: file.name } }));
      setField(key, url);
    } catch (err) {
      setUploads((u) => ({ ...u, [key]: { uploading: false, url: null, error: err, filename: file.name } }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // 필수 필드 검증
      for (const field of schema) {
        if (field.required && !values[field.key]) {
          throw new ApiError({
            status: 0,
            code: "validation",
            message: `[${field.label}] 은(는) 필수입니다.`,
          });
        }
      }
      await contestsApi.entries.create(contestId, { fields: values });
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
        const id = `field-${field.key}`;
        const v = values[field.key];
        const up = uploads[field.key];
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
              {up?.url && (
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

      {error && (
        <div className="callout-box is-pending">
          <strong>제출 실패</strong>
          {error.message || "다시 시도해 주세요."}
        </div>
      )}
      {success && (
        <div className="callout-box">
          <strong>제출 완료</strong>
          참가가 정상 등록되었습니다. 콘테스트 페이지로 이동합니다.
        </div>
      )}

      <div className="form-divider" />
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "제출 중…" : "참가 제출"}
      </button>
    </form>
  );
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
