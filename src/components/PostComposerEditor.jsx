"use client";

import { useRef, useState } from "react";
import MarkdownBody from "@/components/MarkdownBody";

function linePrefix(text, prefix) {
  const body = text || "";
  return body
    .split("\n")
    .map((line) => (line.trim() ? `${prefix}${line}` : prefix.trimEnd()))
    .join("\n");
}

export default function PostComposerEditor({
  id,
  label = "본문",
  value,
  onChange,
  placeholder,
  rows = 16,
  fieldClassName = "form-row",
  textareaClassName = "form-textarea",
  labelClassName = "",
  templates = [],
}) {
  const textareaRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const body = value || "";
  const lineCount = body ? body.split(/\n/).length : 1;

  function focusSelection(start, end = start) {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, end);
    });
  }

  function replaceRange(start, end, text, selectStart = null, selectEnd = null) {
    const next = `${body.slice(0, start)}${text}${body.slice(end)}`;
    onChange(next);
    const base = start;
    focusSelection(
      selectStart === null ? base + text.length : base + selectStart,
      selectEnd === null ? base + text.length : base + selectEnd,
    );
  }

  function getSelection() {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    return { start, end, selected: body.slice(start, end) };
  }

  function wrap(prefix, suffix, fallback) {
    const { start, end, selected } = getSelection();
    const inner = selected || fallback;
    replaceRange(start, end, `${prefix}${inner}${suffix}`, prefix.length, prefix.length + inner.length);
  }

  function insertBlock(text) {
    if (!text) return;
    const { start, end } = getSelection();
    const before = body.slice(0, start);
    const after = body.slice(end);
    const prefix = before && !before.endsWith("\n") ? "\n\n" : "";
    const suffix = after && !after.startsWith("\n") ? "\n\n" : "";
    replaceRange(start, end, `${prefix}${text}${suffix}`, prefix.length, prefix.length + text.length);
  }

  function applyTool(tool) {
    const { start, end, selected } = getSelection();
    if (tool === "bold") wrap("**", "**", "굵게");
    if (tool === "italic") wrap("*", "*", "기울임");
    if (tool === "link") wrap("[", "](https://)", "링크 텍스트");
    if (tool === "code") {
      if (selected.includes("\n")) insertBlock(`\`\`\`\n${selected || "코드"}\n\`\`\``);
      else wrap("`", "`", "코드");
    }
    if (tool === "quote") replaceRange(start, end, linePrefix(selected || "인용", "> "), 2, 2 + (selected || "인용").length);
    if (tool === "list") replaceRange(start, end, linePrefix(selected || "항목", "- "), 2, 2 + (selected || "항목").length);
    if (tool === "check") replaceRange(start, end, linePrefix(selected || "할 일", "- [ ] "), 6, 6 + (selected || "할 일").length);
    if (tool === "h2") replaceRange(start, end, `## ${selected || "소제목"}`, 3, 3 + (selected || "소제목").length);
    if (tool === "hr") insertBlock("---");
  }

  const toolItems = [
    ["bold", "B", "굵게"],
    ["italic", "I", "기울임"],
    ["h2", "H2", "소제목"],
    ["quote", ">", "인용"],
    ["list", "-", "목록"],
    ["check", "☑", "체크 목록"],
    ["link", "↗", "링크"],
    ["code", "</>", "코드"],
    ["hr", "―", "구분선"],
  ];

  return (
    <div className={`${fieldClassName} post-editor post-editor--hurock`}>
      <div className="post-editor__head">
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
        <div className="post-editor__tools" aria-label="본문 작성 도구">
          {toolItems.map(([tool, text, title]) => (
            <button
              key={tool}
              type="button"
              className="post-editor__tool"
              onClick={() => applyTool(tool)}
              title={title}
              aria-label={title}
            >
              {text}
            </button>
          ))}
          {templates.map((template) => (
            <button
              key={template.label}
              type="button"
              className="post-editor__tool post-editor__tool--wide"
              onClick={() => insertBlock(typeof template.getText === "function" ? template.getText() : template.text)}
            >
              {template.label}
            </button>
          ))}
          <button
            type="button"
            className={`post-editor__tool post-editor__tool--wide${preview ? " is-active" : ""}`}
            onClick={() => setPreview((v) => !v)}
            aria-pressed={preview}
          >
            {preview ? "편집" : "미리보기"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="post-editor__preview" aria-label="본문 미리보기">
          <MarkdownBody source={body || "미리볼 본문이 없습니다."} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          className={textareaClassName}
          placeholder={placeholder}
          rows={rows}
          value={body}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <div className="post-editor__meter" aria-live="polite">
        <span>
          <code>**굵게**</code> <code>- 목록</code> <code>[링크](url)</code> <code>`코드`</code> 지원
        </span>
        <strong className={body.length > 4500 ? "is-warn" : ""}>
          {body.length}자 · {lineCount}줄
        </strong>
      </div>
    </div>
  );
}
