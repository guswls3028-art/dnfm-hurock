import PageShell from "@/components/PageShell";

export const metadata = {
  title: "이용약관 — 허락방",
};

export default function TermsPage() {
  return (
    <PageShell activePath="/terms">
      <div className="page-head">
        <div>
          <h1>이용약관</h1>
          <p>최종 개정일: 2026-05-14</p>
        </div>
      </div>

      <article
        className="form-block"
        style={{ display: "grid", gap: 16, lineHeight: 1.7 }}
      >
        <section>
          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 허락방(<strong>hurock.dnfm.kr</strong>, 이하 &ldquo;서비스&rdquo;)이
            제공하는 시청자 커뮤니티·콘테스트·게시판 서비스를 이용함에 있어
            서비스와 이용자(이하 &ldquo;회원&rdquo;)의 권리·의무 및 책임사항을 규정합니다.
          </p>
        </section>

        <section>
          <h2>제2조 (정의)</h2>
          <ul>
            <li>
              <strong>회원</strong>: 본 약관에 동의하고 서비스에 가입하여 아이디를 부여받은 자.
            </li>
            <li>
              <strong>비회원</strong>: 회원 가입 없이 임시 닉네임·임시 비밀번호로 글·댓글을 작성하는 자.
            </li>
            <li>
              <strong>콘텐츠</strong>: 회원/비회원이 서비스에 게시·업로드한 글·이미지·콘테스트 출품물 등 일체.
            </li>
          </ul>
        </section>

        <section>
          <h2>제3조 (회원 가입)</h2>
          <ul>
            <li>가입 시 아이디·비밀번호·닉네임·시청 플랫폼(선택)을 입력합니다.</li>
            <li>비밀번호는 최소 4자 이상이며, 평문 저장 없이 bcrypt 해시로만 보관합니다.</li>
            <li>OAuth(구글·카카오) 가입 시 외부 제공자의 식별자만 저장하며, 비밀번호는 보관하지 않습니다.</li>
            <li>본인의 정보를 정확히 입력해야 하며, 타인의 정보로 가입할 수 없습니다.</li>
          </ul>
        </section>

        <section>
          <h2>제4조 (계정 보안)</h2>
          <ul>
            <li>회원은 본인 아이디·비밀번호 관리 책임을 부담합니다.</li>
            <li>로그인 디바이스 목록은 마이페이지에서 확인·개별 로그아웃 가능합니다.</li>
            <li>비밀번호 변경 시 모든 디바이스 세션은 즉시 무효화됩니다.</li>
          </ul>
        </section>

        <section>
          <h2>제5조 (콘텐츠의 권리·책임)</h2>
          <ul>
            <li>회원/비회원이 작성한 콘텐츠의 저작권은 작성자에게 있습니다.</li>
            <li>
              서비스 운영 목적(노출·검색·콘테스트 진행)에 한해 서비스가 비독점적·무상으로
              해당 콘텐츠를 사용·복제·전송할 수 있습니다.
            </li>
            <li>타인의 권리를 침해하거나 법령에 위반되는 콘텐츠 작성을 금지합니다.</li>
            <li>운영진은 약관 위반 콘텐츠를 사전 통지 없이 비공개·삭제할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2>제6조 (회원 탈퇴 / 자격 상실)</h2>
          <ul>
            <li>
              회원은 마이페이지 &gt; 회원 탈퇴 메뉴에서 언제든 탈퇴할 수 있습니다.
              탈퇴 시 작성한 콘텐츠는 익명화 처리되며, 게시판 맥락 보존을 위해 본문은 유지될 수 있습니다.
            </li>
            <li>
              아이디·닉네임·비밀번호 해시·OAuth 식별자·세션 정보는 즉시 삭제됩니다.
            </li>
            <li>
              운영진은 약관을 중대하게 위반한 회원의 자격을 정지·박탈할 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>제7조 (서비스 면책)</h2>
          <ul>
            <li>
              본 서비스는 비영리 시청자 커뮤니티이며, 천재지변·시스템 장애 등으로 인한
              일시 중단에 대해 책임을 지지 않습니다.
            </li>
            <li>회원 간 분쟁에 대해 서비스는 중재 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2>제8조 (약관 변경)</h2>
          <p>
            약관 변경 시 서비스 공지 또는 마이페이지를 통해 사전 안내합니다.
            변경 후 계속 이용은 변경 약관에 대한 동의로 간주됩니다.
          </p>
        </section>

        <section>
          <h2>제9조 (문의)</h2>
          <p>
            본 약관에 관한 문의는 운영진(허락 방송 채널 또는 톡방장)을 통해 가능합니다.
          </p>
        </section>
      </article>
    </PageShell>
  );
}
