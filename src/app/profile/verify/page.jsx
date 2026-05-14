"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { ApiError, auth } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [recognized, setRecognized] = useState(false);

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
      if (next.length >= MAX_FILES) {
        setError(`최대 ${MAX_FILES}장`);
        break;
      }
      if (!file.type?.startsWith("image/")) continue;
      if (file.size > MAX_FILE_BYTES) {
        setError(`10MB 초과 (${file.name})`);
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setFiles(next);
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
      });
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
    setSaving(true);
    try {
      const characterSelectNames = perImage
        .filter((p) => p.screenType === "character_select")
        .flatMap((p) => (p.characters || []).map((c) => c.name))
        .filter(Boolean);
      await auth.confirmDnfProfile({
        adventurerName: edited.adventurerName?.trim() || undefined,
        mainCharacterName: edited.mainCharacterName?.trim() || undefined,
        mainCharacterClass: edited.mainCharacterClass?.trim() || undefined,
        characters: merged.characters?.length ? merged.characters : undefined,
        characterSelectNames: characterSelectNames.length ? characterSelectNames : undefined,
      });
      await refresh();
      router.push("/profile?verified=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err?.message || "저장 실패");
      setSaving(false);
    }
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
        <ul style={{ margin: "0 0 12px", paddingLeft: 20, fontSize: "0.92rem" }}>
          <li><strong>모험단 기본정보</strong> — 정보 → 모험단 → 기본정보 (1장)</li>
          <li><strong>보유 캐릭터</strong> — 캐릭이 많으면 1~3장 (선택)</li>
          <li><strong>캐릭터 선택창</strong> — 본인 인증 신호 (사칭 방지)</li>
        </ul>
        <p style={{ fontSize: "0.86rem", color: "var(--ink-muted, #888)" }}>
          항마력은 수집하지 않습니다. 기본정보의 대표 캐릭이 캐릭터 선택창에 있어야 인증 마크가 부여됩니다.
        </p>

        <label
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: "32px 16px", border: "2px dashed var(--primary)", borderRadius: 12,
            cursor: "pointer", textAlign: "center", marginTop: 12,
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
          <strong>캡처 묶어서 한 번에 올리기 (최대 {MAX_FILES}장 · 각 10MB)</strong>
          <span style={{ fontSize: "0.86rem", color: "var(--ink-muted, #888)" }}>
            기본정보·보유캐릭·캐릭터 선택창 — 한 번에 골라 올리면 자동 분류
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
              ✓ 캐릭터 선택창과 매칭 — 인증 마크 부여 예정
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

          {merged.characters?.length ? (
            <div className="form-row">
              <label>캐릭터 목록 ({merged.characters.length})</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {merged.characters.map((c, i) => (
                  <span key={i} style={{ padding: "2px 8px", background: "rgba(0,0,0,0.06)", borderRadius: 4, fontSize: "0.82rem" }}>
                    {c.name}
                    {c.klass ? <em style={{ color: "var(--ink-muted, #888)", fontStyle: "normal" }}> · {c.klass}</em> : null}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

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

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Link href="/profile" className="btn btn-ghost">나중에</Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAuth}
              disabled={saving}
            >
              {saving ? "저장 중…" : "이 정보로 인증 저장"}
            </button>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
