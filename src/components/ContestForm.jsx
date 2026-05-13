"use client";

/**
 * ContestForm — 콘테스트 참가 양식 (form_schema 기반).
 *
 * field types:
 *   - default: text input
 *   - textarea
 *   - file
 *
 * 모든 submit 은 backend 미연동 — disabled + "준비중" 라벨.
 * prefillFrom 가 있으면 안내 텍스트 표시 (dnfProfile 에서 자동 채움 예정).
 */
export default function ContestForm({ schema = [], dnfProfile, disabledReason = "백엔드 연결 전 — 준비중" }) {
  function resolvePrefill(path) {
    if (!path || !dnfProfile) return null;
    const segs = path.split(".");
    let cur = { dnfProfile };
    for (const s of segs) {
      cur = cur?.[s];
      if (cur === undefined) return null;
    }
    return cur;
  }

  return (
    <form
      className="form-block"
      onSubmit={(e) => {
        e.preventDefault();
      }}
      aria-label="콘테스트 참가 폼"
    >
      <div className="form-step">참가 양식</div>
      {schema.map((field) => {
        const id = `field-${field.key}`;
        const prefill = resolvePrefill(field.prefillFrom);
        return (
          <div className="form-row" key={field.key}>
            <label htmlFor={id}>
              {field.label}
              {field.required ? " *" : ""}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={id}
                className="form-textarea"
                placeholder={field.placeholder || ""}
                defaultValue={prefill || ""}
              />
            ) : field.type === "file" ? (
              <div className="form-file-drop">
                사진 1장 드래그 또는 클릭 (준비중)
              </div>
            ) : (
              <input
                id={id}
                type="text"
                className="form-input"
                placeholder={field.placeholder || ""}
                defaultValue={prefill || ""}
              />
            )}
            {field.prefillFrom && (
              <small>내 페이지의 던파 프로필에서 자동 채움: {field.prefillFrom}</small>
            )}
          </div>
        );
      })}
      <div className="form-divider" />
      <button type="submit" className="btn btn-primary is-disabled" disabled title={disabledReason}>
        참가 제출 <span className="btn-note">({disabledReason})</span>
      </button>
    </form>
  );
}
