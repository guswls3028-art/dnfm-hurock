import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";

export const metadata = { title: "가입" };

export default function SignupPage() {
  return (
    <PageShell activePath="/signup">
      <div className="page-head">
        <div>
          <h1>허락방 가입</h1>
          <p>2단계. (1) 기본 정보 + (2) 던파 인증 캡처 3종.</p>
        </div>
        <StickerBadge tone="lime" rotate="r">
          2-step
        </StickerBadge>
      </div>

      <div className="grid grid-2">
        <form className="form-block" action="#" method="post" aria-label="가입 1단계 폼">
          <div className="form-step">Step 1 — 기본 정보</div>
          <div className="form-row">
            <label htmlFor="signup-nick">닉네임</label>
            <input id="signup-nick" className="form-input" type="text" placeholder="허락방에서 쓸 이름" />
          </div>
          <div className="form-row">
            <label htmlFor="signup-email">이메일</label>
            <input id="signup-email" className="form-input" type="email" placeholder="me@example.com" />
          </div>
          <div className="form-row">
            <label htmlFor="signup-pw">비밀번호</label>
            <input id="signup-pw" className="form-input" type="password" placeholder="4자 이상" />
            <small>최소 4자만 넘으면 OK. 학생/시청자 친화 정책.</small>
          </div>
          <div className="form-row">
            <label htmlFor="signup-pw2">비밀번호 확인</label>
            <input id="signup-pw2" className="form-input" type="password" />
          </div>
          <button type="submit" className="btn btn-primary is-disabled" disabled title="백엔드 연결 전">
            다음 (Step 2) <span className="btn-note">(준비중)</span>
          </button>
        </form>

        <form className="form-block" action="#" method="post" aria-label="가입 2단계 폼">
          <div className="form-step">Step 2 — 던파 캡처 인증</div>
          <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            모험단/캐릭터/장비 정보 캡처 3종을 올리면 OCR 로 자동 추출해 프로필을 채웁니다. 어드민이 한 번 확인합니다.
          </p>
          <div className="form-row">
            <label>① 모험단 캡처</label>
            <div className="form-file-drop">모험단명/소속 캐릭터가 보이는 캡처</div>
          </div>
          <div className="form-row">
            <label>② 캐릭터 정보 캡처</label>
            <div className="form-file-drop">캐릭터명/직업/서버가 보이는 캡처</div>
          </div>
          <div className="form-row">
            <label>③ 장비 캡처</label>
            <div className="form-file-drop">현재 장착 장비 일람</div>
          </div>
          <div className="callout-box is-pending">
            <strong>OCR 연결 전</strong>
            현재는 자리만 잡혀 있고 실제 업로드/추출 동작은 backend 연결 후 켜집니다.
          </div>
          <button type="submit" className="btn btn-primary is-disabled" disabled>
            가입 완료 <span className="btn-note">(준비중)</span>
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18, fontSize: "0.86rem" }}>
        이미 계정이 있다면{" "}
        <Link href="/login" style={{ borderBottom: "2px solid var(--primary)", color: "var(--primary-ink)", fontWeight: 800 }}>
          로그인
        </Link>
      </div>
    </PageShell>
  );
}
