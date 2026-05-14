"use client";

/**
 * 시청 플랫폼 + 시청자 닉네임 입력 필드.
 *
 * 사용: hurock 가입 페이지 또는 마이페이지 설정.
 *   <ViewerPlatformField
 *     value={{ platform: "youtube", nickname: "닉" }}
 *     onChange={(next) => ...}
 *   />
 *
 * 정책:
 *   - 3개 플랫폼: youtube / soop / chzzk
 *   - 플랫폼 미선택 + 닉네임 비움 = 미설정 (null)
 *   - 사용자가 자유롭게 선택. 미설정도 정상 (인증 강제 X).
 */

const PLATFORMS = [
  {
    id: "youtube",
    label: "유튜브",
    color: "#ff0033",
    iconUrl: null,
    // brand glyph fallback: 빨간색 ▶
    glyph: "▶",
  },
  {
    id: "soop",
    label: "숲",
    color: "#1cb2e6",
    glyph: "🌳",
  },
  {
    id: "chzzk",
    label: "치지직",
    color: "#00ffa3",
    glyph: "Z",
  },
];

export default function ViewerPlatformField({ value, onChange, idPrefix = "viewer" }) {
  const platform = value?.platform || null;
  const nickname = value?.nickname || "";

  function setPlatform(next) {
    onChange?.({ platform: next === platform ? null : next, nickname });
  }
  function setNickname(next) {
    onChange?.({ platform, nickname: next });
  }

  return (
    <div className="viewer-platform-field">
      <fieldset className="viewer-platform-field__group">
        <legend className="viewer-platform-field__legend">
          어디서 허락님 방송을 보세요?{" "}
          <span className="viewer-platform-field__hint">(선택)</span>
        </legend>
        <div className="viewer-platform-field__buttons">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`viewer-platform-chip viewer-platform-chip--${p.id} ${
                platform === p.id ? "is-active" : ""
              }`}
              onClick={() => setPlatform(p.id)}
              aria-pressed={platform === p.id}
              style={{
                "--vp-color": p.color,
              }}
            >
              <span className="viewer-platform-chip__glyph" aria-hidden="true">
                {p.glyph}
              </span>
              <span className="viewer-platform-chip__label">{p.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-nick`}>
          시청자 닉네임 <span className="viewer-platform-field__hint">(선택)</span>
        </label>
        <input
          id={`${idPrefix}-nick`}
          className="input"
          placeholder="방송에서 사용하는 채팅 닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={32}
        />
        <span className="field__hint">
          사이트 닉네임과 다르게 쓰셔도 됩니다. 콘테스트 당첨자 안내 등에 활용.
        </span>
      </div>
    </div>
  );
}
