/**
 * StickerBadge — B급 톤 sticker 뱃지.
 *
 * tone: pink | cyan | lime | orange | ink | amber(default)
 * rotate: l(default, -2deg) | r(+2deg) | 0(none)
 */
export default function StickerBadge({ tone = "amber", rotate = "l", children, as: Tag = "span" }) {
  const toneClass = tone && tone !== "amber" ? ` sticker-${tone}` : "";
  const rotateClass =
    rotate === "r" ? " sticker-rotate-r" : rotate === "0" ? " sticker-rotate-0" : "";
  return <Tag className={`sticker${toneClass}${rotateClass}`}>{children}</Tag>;
}
