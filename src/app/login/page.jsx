import Link from "next/link";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { loginProviders } from "@/lib/content";

export const metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <PageShell activePath="/login">
      <div className="page-head">
        <div>
          <h1>로그인 / 입장</h1>
          <p>허락방에서 콘테스트 참가하고 글 쓰려면 로그인이 필요해요.</p>
        </div>
        <StickerBadge tone="cyan" rotate="r">
          소셜 로그인 예정
        </StickerBadge>
      </div>

      <div className="grid grid-2">
        <form
          className="form-block"
          action="#"
          method="post"
          aria-label="자체 로그인 폼"
        >
          <div className="form-step">자체 계정</div>
          <div className="form-row">
            <label htmlFor="login-email">이메일 또는 닉네임</label>
            <input id="login-email" className="form-input" type="text" placeholder="허락방에서 쓰는 이름" />
          </div>
          <div className="form-row">
            <label htmlFor="login-pw">비밀번호</label>
            <input id="login-pw" className="form-input" type="password" placeholder="4자 이상" />
            <small>최소 4자. 짧아도 괜찮아요 — brute force 방어는 서버에서.</small>
          </div>
          <button type="submit" className="btn btn-primary is-disabled" disabled title="백엔드 연결 전 — 준비중">
            로그인 <span className="btn-note">(준비중)</span>
          </button>
          <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
            계정이 없으신가요?{" "}
            <Link href="/signup" style={{ borderBottom: "2px solid var(--primary)", color: "var(--primary-ink)", fontWeight: 800 }}>
              가입하기
            </Link>
          </div>
        </form>

        <div className="form-block">
          <div className="form-step">소셜 로그인</div>
          {loginProviders.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn is-disabled"
              disabled
              title={p.note}
              style={{ justifyContent: "flex-start" }}
            >
              {p.label} <span className="btn-note">({p.note})</span>
            </button>
          ))}
          <div className="callout-box is-pending">
            <strong>안내</strong>
            구글/카카오 OAuth 는 backend(api.allow.dnfm.kr) 연결 후 활성화됩니다.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
