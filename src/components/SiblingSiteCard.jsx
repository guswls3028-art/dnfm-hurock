/**
 * SiblingSiteCard — 자매 사이트(뉴비 훈련소) 크로스링크 카드.
 *  - 이미지: https://dnfm.kr/banner.jpg (newb 의 public 자산 — Cloudflare CDN)
 *  - B급 톤 sticker 카드 (살짝 기울어짐, dashed 테두리, 핫핑크 그림자)
 *  - href: https://dnfm.kr (target=_blank)
 */
export default function SiblingSiteCard({ compact = false }) {
  return (
    <a
      className={`sibling-cdn-card${compact ? " is-compact" : ""}`}
      href="https://dnfm.kr"
      target="_blank"
      rel="noreferrer"
    >
      <div className="sibling-cdn-card__media" aria-hidden="true">
        <img
          src="https://dnfm.kr/banner.jpg"
          alt=""
          loading="lazy"
          onError={(e) => {
            // banner.jpg 가 없으면 그냥 빈 그라데이션 유지
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="sibling-cdn-card__sticker">↗ 자매 사이트</span>
      </div>
      <div className="sibling-cdn-card__body">
        <strong>뉴비 훈련소</strong>
        <p>던파 모바일 입문 가이드</p>
        <span className="sibling-cdn-card__url">dnfm.kr</span>
      </div>
    </a>
  );
}
