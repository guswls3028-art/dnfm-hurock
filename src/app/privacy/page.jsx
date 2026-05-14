import PageShell from "@/components/PageShell";

export const metadata = {
  title: "개인정보처리방침 — 허락방",
};

export default function PrivacyPage() {
  return (
    <PageShell activePath="/privacy">
      <div className="page-head">
        <div>
          <h1>개인정보처리방침</h1>
          <p>최종 개정일: 2026-05-14</p>
        </div>
      </div>

      <article
        className="form-block"
        style={{ display: "grid", gap: 16, lineHeight: 1.7 }}
      >
        <section>
          <h2>1. 수집하는 개인정보 항목</h2>
          <ul>
            <li>
              <strong>필수 (자체 가입)</strong>: 아이디(username), 비밀번호 해시(bcrypt), 닉네임(displayName).
            </li>
            <li>
              <strong>필수 (OAuth 가입)</strong>: 외부 제공자의 식별자(provider_user_id),
              제공자 이메일(있을 경우), 닉네임.
            </li>
            <li>
              <strong>선택</strong>: 시청 플랫폼(youtube/soop/chzzk), 시청자 닉네임,
              던파 모바일 모험단명·대표 캐릭터·캐릭터 목록(OCR 인증 시).
            </li>
            <li>
              <strong>자동 수집</strong>: 접속 IP·User-Agent(세션 추적 및 보안 목적),
              로그인 일시, 콘텐츠 작성 일시.
            </li>
          </ul>
        </section>

        <section>
          <h2>2. 수집 목적</h2>
          <ul>
            <li>회원 식별 및 로그인·세션 관리</li>
            <li>커뮤니티·콘테스트·게시판 서비스 제공</li>
            <li>본인 인증(던파 캐릭터 선택창 일치 검증)</li>
            <li>도용·도배·약관 위반 방지 및 운영 통계</li>
          </ul>
        </section>

        <section>
          <h2>3. 보유 기간</h2>
          <ul>
            <li>회원 정보: 회원 탈퇴 시까지. 탈퇴 후 즉시 삭제(콘텐츠는 익명화 보존).</li>
            <li>접속 로그: 30일.</li>
            <li>리프레시 토큰: 발급 후 30일 또는 로그아웃·비밀번호 변경 시.</li>
          </ul>
        </section>

        <section>
          <h2>4. 제3자 제공</h2>
          <p>
            서비스는 회원의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 따라
            수사기관 등의 적법한 절차에 따른 요청이 있는 경우는 예외입니다.
          </p>
        </section>

        <section>
          <h2>5. 처리 위탁</h2>
          <ul>
            <li>
              <strong>Cloudflare R2</strong>: 회원이 업로드한 이미지(프로필 사진·게시판 첨부·콘테스트 출품물·던파 캡처) 저장.
            </li>
            <li>
              <strong>Google Cloud / Gemini API</strong>: 던파 OCR 인증 시 캡처 이미지의 텍스트 인식.
              결과 텍스트만 서비스가 보관하며, 외부 API 보존 정책은 각 제공자의 정책을 따릅니다.
            </li>
            <li>
              <strong>OAuth 제공자 (Google·Kakao)</strong>: 회원이 명시적으로 선택한 경우에 한해
              제공자의 식별자·이메일·닉네임을 받습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. 회원의 권리</h2>
          <ul>
            <li>본인 정보 조회·수정: 마이페이지에서 가능.</li>
            <li>비밀번호 변경: 마이페이지 &gt; 비밀번호 변경.</li>
            <li>회원 탈퇴: 마이페이지 &gt; 회원 탈퇴.</li>
            <li>로그인 디바이스 관리: 마이페이지 &gt; 로그인 디바이스.</li>
          </ul>
        </section>

        <section>
          <h2>7. 안전성 확보 조치</h2>
          <ul>
            <li>비밀번호는 bcrypt 해시 저장. 평문 보관 없음.</li>
            <li>HTTPS 전송(Cloudflare proxy + EC2 SSL).</li>
            <li>JWT 액세스 토큰은 짧은 TTL, 리프레시 토큰은 회전(rotation) + 재사용 감지.</li>
            <li>로그인·가입 API에 IP 기반 rate-limit (분당 10회).</li>
          </ul>
        </section>

        <section>
          <h2>8. 개인정보 보호 책임자</h2>
          <p>
            본 서비스 개인정보 보호 책임자는 톡방장이며, 문의는 허락 방송 채널 또는 톡방을 통해 가능합니다.
          </p>
        </section>

        <section>
          <h2>9. 변경 고지</h2>
          <p>
            본 방침이 변경될 경우 서비스 공지 또는 마이페이지를 통해 사전 안내합니다.
          </p>
        </section>
      </article>
    </PageShell>
  );
}
