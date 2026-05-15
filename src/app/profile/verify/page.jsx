"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  DNF_CLASSES_GROUPED,
  classOptionValue,
  findClassIcon,
  findFirstClassGroup,
  findFirstClassIcon,
  parseClassOptionValue,
} from "@/lib/dnf-classes";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const VERIFY_CAPTURES = [
  { id: "basic_info", label: "모험단 기본정보", hint: "정보 → 모험단 → 기본정보 (1장)", imagePath: "/verify-examples/basic_info.png" },
  { id: "character_list", label: "보유 캐릭터", hint: "캐릭이 많으면 1~3장 (선택)", imagePath: "/verify-examples/character_list.png" },
  { id: "character_select", label: "캐릭터 선택창", hint: "본인 인증 신호 (사칭 방지)", imagePath: "/verify-examples/character_select.png" },
];

const CLASS_GRID_IMAGES = ["/verify-examples/class_grid_1.png", "/verify-examples/class_grid_2.png"];

function formatBytes(n) {
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function screenTypeLabel(t) {
  if (t === "basic_info") return "모험단 기본정보";
  if (t === "character_list") return "보유 캐릭터";
  if (t === "character_select") return "캐릭터 선택창";
  return "분류 불명";
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<PageShell activePath="/profile/verify"><p>불러오는 중…</p></PageShell>}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const isWelcome = params.get("welcome") === "1";
  const { user, loading, refresh } = useCurrentUser();

  const [files, setFiles] = useState([]);
  const [recognizing, setRecognizing] = useState(false);
  const [merged, setMerged] = useState(null);
  const [perImage, setPerImage] = useState([]);
  const [edited, setEdited] = useState({});
  const [editedCharacters, setEditedCharacters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [recognized, setRecognized] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/profile/verify");
  }, [user, loading, router]);

  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(list) {
    if (!list || list.length === 0) return;
    setError(null);
    const next = [...files];
    for (const file of list) {
      if (!file.type?.startsWith("image/")) continue;
      if (file.size > MAX_FILE_BYTES) {
        setError(`10MB 초과 (${file.name})`);
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setFiles(next);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files;
    if (dropped && dropped.length) addFiles(dropped);
  }

  function removeFile(index) {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function handleRecognize() {
    if (recognizing || files.length === 0) return;
    setError(null);
    setRecognizing(true);
    try {
      const data = await auth.ocrAuto(files.map((f) => f.file));
      const m = data?.merged || null;
      const pi = data?.perImage || [];
      setMerged(m);
      setPerImage(pi);
      setEdited({
        adventurerName: m?.adventurerName ?? "",
        mainCharacterName: m?.mainCharacterName ?? "",
        mainCharacterClass: m?.mainCharacterClass ?? "",
        mainCharacterClassGroup: m?.mainCharacterClassGroup ?? "",
      });
      setEditedCharacters(
        (m?.characters || []).map((c) => ({
          name: c.name || "",
          klass: c.klass || "",
          classGroup: c.classGroup || "",
        }))
      );
      setRecognized(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "인식 실패");
    } finally {
      setRecognizing(false);
    }
  }

  async function handleSaveAuth() {
    if (saving || !merged) return;
    setError(null);
    const adventurerName = edited.adventurerName?.trim();
    const mainCharacterName = edited.mainCharacterName?.trim();
    if (!adventurerName || !mainCharacterName) {
      setError("모험단 기본정보 화면에서 모험단명과 대표 캐릭터명을 확인해야 저장할 수 있습니다. 인식값이 비어 있으면 직접 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const characterSelectNames = perImage
        .filter((p) => p.screenType === "character_select")
        .flatMap((p) => (p.characters || []).map((c) => c.name))
        .filter(Boolean);
      const cleanedCharacters = editedCharacters
        .map((c) => ({
          name: (c.name || "").trim(),
          klass: (c.klass || "").trim(),
          classGroup: (c.classGroup || "").trim() || undefined,
        }))
        .filter((c) => c.name);
      const mainCharacterClassGroup =
        edited.mainCharacterClassGroup?.trim() ||
        cleanedCharacters.find((c) => c.name === mainCharacterName)?.classGroup;
      await auth.confirmDnfProfile({
        adventurerName,
        mainCharacterName,
        mainCharacterClass: edited.mainCharacterClass?.trim() || undefined,
        mainCharacterClassGroup: mainCharacterClassGroup || undefined,
        characters: cleanedCharacters.length ? cleanedCharacters : undefined,
        characterSelectNames: characterSelectNames.length ? characterSelectNames : undefined,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => router.push("/profile?verified=1"), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "저장 실패");
      setSaving(false);
    }
  }

  function updateCharacter(idx, patch) {
    setEditedCharacters((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function removeCharacter(idx) {
    setEditedCharacters((prev) => prev.filter((_, i) => i !== idx));
  }
  function addEmptyCharacter() {
    setEditedCharacters((prev) => [...prev, { name: "", klass: "", classGroup: "" }]);
  }

  if (loading) {
    return <PageShell activePath="/profile/verify"><p>불러오는 중…</p></PageShell>;
  }

  return (
    <PageShell activePath="/profile/verify">
      <div className="page-head">
        <div>
          <h1>{isWelcome ? "가입 완료 · 모험단 인증" : "모험단 인증"}</h1>
          <p>
            {isWelcome
              ? `${user?.displayName || "허락팬"}님 환영! 모험단 인증으로 인증 마크를 받으면 콘테스트 참가에 도움됩니다 (선택).`
              : "캡처 묶어서 한 번에 올리면 자동 분류·인식."}
          </p>
        </div>
        <StickerBadge tone="lime" rotate="r">인증 (선택)</StickerBadge>
      </div>

      <section className="form-block">
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8,
            listStyle: "none",
            padding: 0,
            margin: "0 0 12px",
          }}
        >
          {VERIFY_CAPTURES.map((cap) => (
            <li key={cap.id} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cap.imagePath}
                alt={`${cap.label} 예시`}
                loading="lazy"
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid var(--ink-line, #ccc)",
                  background: "rgba(0,0,0,0.04)",
                  display: "block",
                }}
              />
              <strong style={{ fontSize: "0.82rem", lineHeight: 1.25 }}>{cap.label}</strong>
              <span style={{ fontSize: "0.74rem", color: "var(--ink-muted, #888)", lineHeight: 1.3 }}>
                {cap.hint}
              </span>
            </li>
          ))}
        </ul>

        <details
          style={{
            background: "rgba(0,0,0,0.04)",
            borderRadius: 8,
            padding: "10px 14px",
            margin: "0 0 12px",
            border: "1px solid var(--ink-line, #ccc)",
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.92rem" }}>
            직업이 헷갈리면 — 직업 변경 화면 캡처에서 매칭
          </summary>
          <p style={{ fontSize: "0.82rem", color: "var(--ink-muted, #888)", margin: "8px 0 10px" }}>
            OCR 직업명이 잘못 인식되면 (메카닉 남/여 등) 캐릭터 직업 select 에서 바꿔주세요. 아이콘 매칭 참고용.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {CLASS_GRID_IMAGES.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt="직업 변경 화면"
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 6,
                  border: "1px solid var(--ink-line, #ccc)",
                  display: "block",
                }}
              />
            ))}
          </div>
        </details>

        <label
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: "32px 16px",
            border: `2px dashed ${dragOver ? "var(--accent, var(--primary))" : "var(--primary)"}`,
            borderRadius: 12,
            cursor: "pointer", textAlign: "center", marginTop: 12,
            background: dragOver ? "rgba(255, 200, 0, 0.08)" : "transparent",
            transition: "background 120ms ease, border-color 120ms ease",
          }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span style={{ fontSize: 32, lineHeight: 1 }} aria-hidden="true">＋</span>
          <strong>캡처 묶어서 한 번에 올리기 (각 10MB)</strong>
          <span style={{ fontSize: "0.86rem", color: "var(--ink-muted, #888)" }}>
            클릭하거나 드래그해서 올리세요 · 한 번에 골라 올리면 자동 분류
          </span>
        </label>

        {files.length > 0 ? (
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12, marginTop: 16,
            }}
          >
            {files.map((f, i) => (
              <div
                key={i}
                style={{
                  position: "relative", border: "1px solid var(--ink-line, #ccc)",
                  borderRadius: 8, overflow: "hidden", background: "rgba(0,0,0,0.04)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.file.name} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                <div style={{ padding: "4px 8px", fontSize: "0.78rem" }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.file.name}</div>
                  <small style={{ color: "var(--ink-muted, #888)" }}>{formatBytes(f.file.size)}</small>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="제거"
                  style={{
                    position: "absolute", top: 4, right: 4, width: 22, height: 22,
                    borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)",
                    color: "#fff", cursor: "pointer", fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="callout-box is-pending" style={{ marginTop: 12 }}>
            <strong>오류</strong>
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRecognize}
            disabled={files.length === 0 || recognizing}
          >
            {recognizing ? "인식 중…" : "인식 시작"}
          </button>
          <Link href="/profile" className="btn btn-ghost">
            나중에 / 건너뛰기
          </Link>
          {recognized ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMerged(null);
                setPerImage([]);
                setEdited({});
                setRecognized(false);
              }}
              disabled={recognizing}
            >
              결과 초기화
            </button>
          ) : null}
        </div>
      </section>

      {recognized && merged ? (
        <section className="form-block" style={{ marginTop: 16 }}>
          <h2 style={{ margin: "0 0 8px" }}>인식 결과 (수정 가능)</h2>
          {merged.verifiedBySelectScreen ? (
            <p style={{ color: "var(--accent-ok, #2bbd6a)", fontWeight: 700 }}>
              ✓ 캐릭터 선택창과 매칭 — 인증 마크가 부여됩니다
            </p>
          ) : (
            <p style={{ color: "var(--ink-muted, #888)" }}>
              대표 캐릭이 캐릭터 선택창 목록에 없어 인증 마크는 미부여. 정보는 저장됩니다.
            </p>
          )}

          <div className="form-row">
            <label htmlFor="vf-adv">모험단명</label>
            <input
              id="vf-adv"
              className="form-input"
              value={edited.adventurerName ?? ""}
              onChange={(e) => setEdited((p) => ({ ...p, adventurerName: e.target.value }))}
              placeholder="예: 소비에트연맹"
            />
          </div>
          <div className="form-row">
            <label htmlFor="vf-main">대표 캐릭터 이름</label>
            <input
              id="vf-main"
              className="form-input"
              value={edited.mainCharacterName ?? ""}
              onChange={(e) => setEdited((p) => ({ ...p, mainCharacterName: e.target.value }))}
              placeholder="예: 지금간다"
            />
          </div>
          <div className="form-row">
            <label htmlFor="vf-cls">대표 캐릭터 직업</label>
            <input
              id="vf-cls"
              className="form-input"
              value={edited.mainCharacterClass ?? ""}
              onChange={(e) => setEdited((p) => ({ ...p, mainCharacterClass: e.target.value }))}
              placeholder="예: 엘레멘탈마스터"
            />
          </div>

          <div className="form-row">
            <label>캐릭터 목록 ({editedCharacters.length}) · 잘못 인식된 이름·직업은 직접 고쳐주세요</label>
            <div style={{ display: "grid", gap: 6 }}>
              {editedCharacters.map((c, i) => {
                const iconSrc = findClassIcon(c.classGroup, c.klass) || findFirstClassIcon(c.klass);
                return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px minmax(0,1fr) minmax(0,1.4fr) auto",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  {iconSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={iconSrc}
                      alt={c.klass}
                      width={36}
                      height={36}
                      style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--ink-line, #ddd)" }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.08)" }}
                    />
                  )}
                  <input
                    className="form-input"
                    value={c.name}
                    onChange={(e) => updateCharacter(i, { name: e.target.value })}
                    placeholder="캐릭명"
                    aria-label={`캐릭터 ${i + 1} 이름`}
                  />
                  <select
                    className="form-input"
                    value={
                      c.klass
                        ? classOptionValue(
                            c.classGroup || findFirstClassGroup(c.klass),
                            c.klass,
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const parsed = parseClassOptionValue(e.target.value);
                      updateCharacter(i, {
                        klass: parsed.baseClass,
                        classGroup: parsed.classGroup,
                      });
                    }}
                    aria-label={`캐릭터 ${i + 1} 직업`}
                  >
                    <option value="">직업 선택</option>
                    {DNF_CLASSES_GROUPED.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.classes.map((kls) => (
                          <option key={`${g.group}::${kls}`} value={classOptionValue(g.group, kls)}>
                            {g.group} · {kls}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeCharacter(i)}
                    aria-label="제거"
                  >
                    ✕
                  </button>
                </div>
                );
              })}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={addEmptyCharacter}
                style={{ justifySelf: "start" }}
              >
                + 캐릭터 추가
              </button>
            </div>
          </div>

          <details style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,0,0,0.04)", borderRadius: 6 }}>
            <summary style={{ cursor: "pointer", fontSize: "0.86rem", color: "var(--ink-muted, #888)" }}>
              이미지별 분류 결과 ({perImage.length})
            </summary>
            <ul style={{ listStyle: "none", padding: "8px 0 0", margin: 0, fontSize: "0.86rem" }}>
              {perImage.map((p, i) => (
                <li key={i}>
                  <code style={{ color: "var(--ink-muted, #888)" }}>#{p.index + 1}</code>{" "}
                  {p.fileName} — <strong>{screenTypeLabel(p.screenType)}</strong>
                </li>
              ))}
            </ul>
          </details>

          {saved ? (
            <p style={{ color: "var(--accent-ok, #2bbd6a)", fontWeight: 700, marginTop: 12 }} role="status">
              ✓ 저장 완료 — 프로필로 이동합니다…
            </p>
          ) : null}
          {error ? (
            <div className="callout-box is-pending" style={{ marginTop: 12 }} role="alert">
              <strong>저장 실패</strong>
              {error}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Link href="/profile" className="btn btn-ghost">나중에</Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAuth}
              disabled={saving || saved}
            >
              {saved ? "✓ 저장 완료" : saving ? "저장 중…" : "이 정보로 인증 저장"}
            </button>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
