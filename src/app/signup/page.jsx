"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import DnfProfileForm from "@/components/DnfProfileForm";
import { ApiError, auth } from "@/lib/api-client";

/**
 * 가입 페이지 — 2단계.
 *   Step 1: username/password/displayName + 중복 inline 검사
 *   Step 2: DnfProfileForm (캡처 3종 OCR)
 * 완료 시 / 로 redirect.
 */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: "",
    displayName: "",
  });
  const [availability, setAvailability] = useState({}); // { username: true|false|"checking", displayName: ... }
  const [signupError, setSignupError] = useState(null);
  const [step1Busy, setStep1Busy] = useState(false);
  const checkTimer = useRef(null);

  useEffect(() => () => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function debounceCheck(username, displayName) {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await auth.checkAvailability({ username, displayName });
        setAvailability({
          username: res?.username ?? null,
          displayName: res?.displayName ?? null,
        });
      } catch {
        // 백엔드 응답 없어도 가입 시도까지는 막지 않음
        setAvailability({});
      }
    }, 320);
  }

  function onUsernameChange(v) {
    update("username", v);
    if (v.length >= 3) {
      setAvailability((a) => ({ ...a, username: "checking" }));
      debounceCheck(v, form.displayName);
    } else {
      setAvailability((a) => ({ ...a, username: null }));
    }
  }

  function onDisplayNameChange(v) {
    update("displayName", v);
    if (v.length >= 2) {
      setAvailability((a) => ({ ...a, displayName: "checking" }));
      debounceCheck(form.username, v);
    } else {
      setAvailability((a) => ({ ...a, displayName: null }));
    }
  }

  function validateStep1() {
    if (!form.username || form.username.length < 3) return "아이디는 3자 이상.";
    if (!form.password || form.password.length < 4) return "비밀번호는 4자 이상.";
    if (form.password !== form.password2) return "비밀번호 확인이 다릅니다.";
    if (!form.displayName || form.displayName.length < 2) return "닉네임은 2자 이상.";
    if (availability.username === false) return "이미 사용 중인 아이디입니다.";
    if (availability.displayName === false) return "이미 사용 중인 닉네임입니다.";
    return null;
  }

  async function handleStep1Submit(e) {
    e.preventDefault();
    setSignupError(null);
    const v = validateStep1();
    if (v) {
      setSignupError({ message: v });
      return;
    }
    setStep1Busy(true);
    // 최종 가용성 확인
    try {
      const res = await auth.checkAvailability({
        username: form.username,
        displayName: form.displayName,
      });
      if (res?.username === false || res?.displayName === false) {
        setAvailability({
          username: res.username,
          displayName: res.displayName,
        });
        setSignupError({ message: "중복된 값이 있습니다. 다시 확인해 주세요." });
        setStep1Busy(false);
        return;
      }
    } catch {
      /* 무시 — 다음 단계에서 가입 시점에 다시 검증 */
    }
    setStep1Busy(false);
    setStep(2);
  }

  async function handleStep2Confirm(dnfPayload) {
    // DnfProfileForm 새 payload shape:
    //   { adventurerName, mainCharacterName, characters?, characterListNames?,
    //     characterSelectNames?, captureR2Keys? }
    setSignupError(null);
    try {
      const dnfProfile = {
        adventurerName: dnfPayload.adventurerName,
        mainCharacterName: dnfPayload.mainCharacterName,
        characters: dnfPayload.characters,
        captureR2Keys: dnfPayload.captureR2Keys
          ? {
              basicInfo: dnfPayload.captureR2Keys.basicInfo,
              characterList: dnfPayload.captureR2Keys.characterList,
              characterSelect: dnfPayload.captureR2Keys.characterSelect,
            }
          : undefined,
      };
      await auth.signupLocal({
        username: form.username,
        password: form.password,
        displayName: form.displayName,
        dnfProfile,
      });
      // signup 응답이 자동 로그인 cookie 발급함. confirm endpoint 로 verifiedBySelectScreen 계산.
      try {
        await auth.confirmDnfProfile({
          adventurerName: dnfPayload.adventurerName,
          mainCharacterName: dnfPayload.mainCharacterName,
          characters: dnfPayload.characters,
          characterListNames: dnfPayload.characterListNames,
          characterSelectNames: dnfPayload.characterSelectNames,
          captureR2Keys: dnfPayload.captureR2Keys,
        });
      } catch (confirmErr) {
        // confirm 실패해도 회원 자체는 가입됨 — 안내 후 진행
        if (typeof console !== "undefined" && console.warn) {
          console.warn("dnf-profile confirm failed:", confirmErr);
        }
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setSignupError(err);
      } else {
        setSignupError({ message: err?.message || "가입 실패" });
      }
      throw err;
    }
  }

  function availabilityHint(field) {
    const v = availability[field];
    if (v === "checking")
      return (
        <small className="avail-hint avail-hint--checking">
          <span aria-hidden="true">⏳</span> 확인중…
        </small>
      );
    if (v === true)
      return (
        <small className="avail-hint avail-hint--ok">
          <span aria-hidden="true">✓</span> 사용 가능
        </small>
      );
    if (v === false)
      return (
        <small className="avail-hint avail-hint--bad">
          <span aria-hidden="true">✗</span> 이미 사용 중
        </small>
      );
    return null;
  }

  // 비밀번호 일치 inline 표시.
  const passwordMatch =
    !form.password || !form.password2
      ? null
      : form.password === form.password2
        ? "ok"
        : "mismatch";

  return (
    <PageShell activePath="/signup">
      <div className="page-head">
        <div>
          <h1>허락방 가입</h1>
          <p>
            2단계. (1) 기본 정보 + (2) 던파 캡처 3종.
            현재 단계: <strong>{step}/2</strong>
          </p>
        </div>
        <StickerBadge tone="lime" rotate="r">
          {step === 1 ? "Step 1" : "Step 2"}
        </StickerBadge>
      </div>

      {step === 1 && (
        <form
          className="form-block"
          onSubmit={handleStep1Submit}
          aria-label="가입 1단계 폼"
        >
          <div className="form-step">Step 1 — 기본 정보</div>
          <div className="form-row">
            <label htmlFor="signup-username">아이디 (영문/숫자)</label>
            <input
              id="signup-username"
              className="form-input"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="로그인용 ID (3자 이상)"
              required
            />
            {availabilityHint("username")}
          </div>
          <div className="form-row">
            <label htmlFor="signup-nick">닉네임 (한글 OK)</label>
            <input
              id="signup-nick"
              className="form-input"
              type="text"
              value={form.displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="허락방에서 쓸 이름"
              required
            />
            {availabilityHint("displayName")}
          </div>
          <div className="form-row">
            <label htmlFor="signup-pw">비밀번호</label>
            <input
              id="signup-pw"
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="4자 이상"
              required
            />
            <small>최소 4자만 넘으면 OK. 학생/시청자 친화 정책.</small>
          </div>
          <div className="form-row">
            <label htmlFor="signup-pw2">비밀번호 확인</label>
            <input
              id="signup-pw2"
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={form.password2}
              onChange={(e) => update("password2", e.target.value)}
              required
            />
            {passwordMatch === "ok" ? (
              <small className="avail-hint avail-hint--ok">
                <span aria-hidden="true">✓</span> 일치합니다
              </small>
            ) : passwordMatch === "mismatch" ? (
              <small className="avail-hint avail-hint--bad">
                <span aria-hidden="true">✗</span> 비밀번호가 다릅니다
              </small>
            ) : null}
          </div>

          {signupError && (
            <div className="callout-box is-pending">
              <strong>확인 필요</strong>
              {signupError.message || "다시 시도해 주세요."}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={step1Busy}
          >
            {step1Busy ? "확인중…" : "다음 (Step 2)"}
          </button>
        </form>
      )}

      {step === 2 && (
        <>
          <DnfProfileForm
            onConfirm={handleStep2Confirm}
            busyText="가입 처리중…"
          />
          {signupError && step === 2 && (
            <div className="callout-box is-pending" style={{ marginTop: 12 }}>
              <strong>가입 실패</strong>
              {signupError.message || "다시 시도해 주세요."}
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: 12 }}
            onClick={() => setStep(1)}
          >
            ← 이전 단계
          </button>
        </>
      )}

      <div style={{ marginTop: 18, fontSize: "0.86rem" }}>
        이미 계정이 있다면{" "}
        <Link
          href="/login"
          style={{
            borderBottom: "2px solid var(--primary)",
            color: "var(--primary-ink)",
            fontWeight: 800,
          }}
        >
          로그인
        </Link>
      </div>
    </PageShell>
  );
}
