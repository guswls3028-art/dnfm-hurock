import { API_BASE } from "@/lib/api-client";

export function uploadPublicUrl(value) {
  const key = extractR2Key(value);
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${API_BASE}/uploads/r2/${encoded}`;
}

export function extractR2Key(value) {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value !== "object") return null;
  return (
    value.r2Key ||
    value.key ||
    value.url ||
    value.publicUrl ||
    value.imageUrl ||
    null
  );
}

export function entryPhotoValue(entry) {
  const fields = entry?.fields && typeof entry.fields === "object" ? entry.fields : entry || {};
  return (
    fields.photoLook ||
    fields.photo ||
    fields.image ||
    fields.imageUrl ||
    fields.photoUrl ||
    fields.thumbnail ||
    entry?.photoLook ||
    entry?.photo ||
    entry?.image ||
    entry?.imageUrl ||
    entry?.photoUrl ||
    entry?.thumbnail ||
    null
  );
}
