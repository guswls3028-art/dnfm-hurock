/**
 * api-client.js — hurock.dnfm.kr → api.dnfm.kr
 *
 * 공통 fetch wrapper.
 *   - base = NEXT_PUBLIC_API_BASE 또는 https://api.dnfm.kr (prod 기본)
 *   - credentials: "include" — 쿠키 도메인은 .dnfm.kr 이라 sibling subdomain 공유
 *   - JSON body / multipart 자동 처리
 *   - 응답 envelope `{ data }` 자동 unwrap, `{ error: {code,message,details} }` → ApiError throw
 *   - timeout 15s (AbortController)
 *
 * 사용:
 *   const me = await auth.me();
 *   const list = await posts.list({ category: "free", page: 1 });
 */

const DEFAULT_BASE = "https://api.dnfm.kr";
const SITE = "hurock";
const DEFAULT_TIMEOUT_MS = 15_000;

function resolveBase() {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE.replace(/\/+$/, "");
  }
  return DEFAULT_BASE;
}

export const API_BASE = resolveBase();

export class ApiError extends Error {
  constructor({ status, code, message, details, raw }) {
    super(message || `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code || null;
    this.details = details || null;
    this.raw = raw;
  }
}

function joinUrl(base, path) {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return base.replace(/\/$/, "") + p;
}

function buildQuery(query) {
  if (!query) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/**
 * 저수준 호출. envelope `{data}` 자동 unwrap.
 *
 * @param {string} path
 * @param {object} init
 *   - json: any — JSON 직렬화 + Content-Type
 *   - form: FormData — multipart (boundary 자동)
 *   - query: Record<string, any> — querystring
 *   - timeoutMs: number — 기본 15s
 *   - raw: true — Response 그대로 반환
 */
export async function apiFetch(path, init = {}) {
  const {
    json,
    form,
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    raw = false,
    headers: extraHeaders,
    ...rest
  } = init;

  const url = joinUrl(API_BASE, path) + buildQuery(query);
  const headers = { Accept: "application/json", ...(extraHeaders || {}) };
  let body = rest.body;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form !== undefined) {
    body = form;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: rest.method || (body ? "POST" : "GET"),
      credentials: "include",
      headers,
      body,
      signal: controller.signal,
      ...(rest.cache ? { cache: rest.cache } : {}),
    });
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === "AbortError") {
      throw new ApiError({
        status: 0,
        code: "timeout",
        message: `요청 시간 초과 (${timeoutMs}ms)`,
      });
    }
    throw new ApiError({
      status: 0,
      code: "network",
      message: err?.message || "네트워크 오류",
    });
  } finally {
    clearTimeout(timer);
  }

  if (raw) return res;

  let payload = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  } else {
    try {
      await res.text();
    } catch {}
  }

  if (!res.ok) {
    const errBody = payload && payload.error ? payload.error : null;
    throw new ApiError({
      status: res.status,
      code: errBody?.code || `http_${res.status}`,
      message: errBody?.message || `요청 실패 (${res.status})`,
      details: errBody?.details || null,
      raw: payload,
    });
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data;
  }
  return payload;
}

export function buildApiUrl(path) {
  return joinUrl(API_BASE, path);
}

/* ---------- Auth ---------- */

export const auth = {
  me: () => apiFetch("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  loginLocal: ({ username, password }) =>
    apiFetch("/auth/login/local", { method: "POST", json: { username, password } }),
  signupLocal: ({
    username,
    password,
    displayName,
    dnfProfile,
    characterListNames,
    characterSelectNames,
    captureR2Keys,
  }) =>
    apiFetch("/auth/signup/local", {
      method: "POST",
      json: {
        username,
        password,
        displayName,
        dnfProfile,
        characterListNames,
        characterSelectNames,
        captureR2Keys,
      },
    }),
  checkAvailability: ({ username, displayName }) =>
    apiFetch("/auth/check-availability", { query: { username, displayName } }),
  refresh: () => apiFetch("/auth/refresh", { method: "POST" }),
  // dnf-profile OCR — multipart 또는 JSON (presigned URL 이미 업로드된 경우)
  ocrDnfProfile: ({ type, file, fileUrl }) => {
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      return apiFetch(`/auth/dnf-profile/ocr/${type}`, { method: "POST", form: fd });
    }
    return apiFetch(`/auth/dnf-profile/ocr/${type}`, {
      method: "POST",
      json: { fileUrl },
    });
  },
  confirmDnfProfile: (data) =>
    apiFetch("/auth/dnf-profile/confirm", { method: "POST", json: data }),
};

/* ---------- Posts (board) ---------- */

const sitePath = (path) => `/sites/${SITE}${path}`;

export const posts = {
  categories: () => apiFetch(sitePath("/categories")),
  list: ({ categoryId, flair, postType, bestOnly, q, page, pageSize, sort } = {}) =>
    apiFetch(sitePath("/posts"), {
      query: { categoryId, flair, postType, bestOnly, q, page, pageSize, sort },
    }),
  detail: (id) => apiFetch(sitePath(`/posts/${id}`)),
  create: ({
    categoryId,
    categorySlug,
    title,
    body,
    bodyFormat,
    flair,
    postType,
    attachmentR2Keys,
    guestNickname,
    guestPassword,
  }) =>
    apiFetch(sitePath("/posts"), {
      method: "POST",
      json: {
        categoryId,
        categorySlug,
        title,
        body,
        bodyFormat,
        flair,
        postType,
        attachmentR2Keys,
        guestNickname,
        guestPassword,
      },
    }),
  update: (id, input) =>
    apiFetch(sitePath(`/posts/${id}`), { method: "PATCH", json: input }),
  remove: (id, { guestPassword } = {}) =>
    apiFetch(sitePath(`/posts/${id}`), {
      method: "DELETE",
      json: { guestPassword },
    }),
  // voteType: "recommend" | "downvote" (backend postVoteTypes enum)
  vote: (id, voteType) =>
    apiFetch(sitePath(`/posts/${id}/vote`), { method: "POST", json: { voteType } }),
};

/* ---------- Comments ---------- */

export const comments = {
  list: (postId, { page, pageSize } = {}) =>
    apiFetch(sitePath(`/posts/${postId}/comments`), { query: { page, pageSize } }),
  mine: ({ page, pageSize } = {}) =>
    apiFetch(sitePath("/me/comments"), { query: { page, pageSize } }),
  create: (postId, { body, parentId, guestNickname, guestPassword }) =>
    apiFetch(sitePath(`/posts/${postId}/comments`), {
      method: "POST",
      json: { body, parentId, guestNickname, guestPassword },
    }),
  update: (id, { body, guestPassword } = {}) =>
    apiFetch(sitePath(`/comments/${id}`), {
      method: "PATCH",
      json: { body, guestPassword },
    }),
  remove: (id, { guestPassword } = {}) =>
    apiFetch(sitePath(`/comments/${id}`), {
      method: "DELETE",
      json: { guestPassword },
    }),
};

/* ---------- Reports (신고) ---------- */

export const reports = {
  create: ({ targetType, targetId, reason, detail }) =>
    apiFetch(sitePath("/reports"), {
      method: "POST",
      json: { targetType, targetId, reason, detail },
    }),
  list: ({ status, targetType, page, pageSize } = {}) =>
    apiFetch(sitePath("/reports"), {
      query: { status, targetType, page, pageSize },
    }),
  update: (id, { status, resolution, resolutionNote, moderatorMemo }) =>
    apiFetch(sitePath(`/reports/${id}`), {
      method: "PATCH",
      json: { status, resolution, resolutionNote, moderatorMemo },
    }),
};

/* ---------- Contests ---------- */

export const contests = {
  list: ({ status, page, pageSize } = {}) =>
    apiFetch(sitePath("/contests"), { query: { status, page, pageSize } }),
  detail: (id) => apiFetch(sitePath(`/contests/${id}`)),
  create: (data) => apiFetch(sitePath("/contests"), { method: "POST", json: data }),
  update: (id, input) =>
    apiFetch(sitePath(`/contests/${id}`), { method: "PATCH", json: input }),
  remove: (id) => apiFetch(sitePath(`/contests/${id}`), { method: "DELETE" }),
  entries: {
    list: (contestId, { selectedOnly } = {}) =>
      apiFetch(sitePath(`/contests/${contestId}/entries`), { query: { selectedOnly } }),
    create: (contestId, data) =>
      apiFetch(sitePath(`/contests/${contestId}/entries`), {
        method: "POST",
        json: data,
      }),
    select: (contestId, entryId, { selectedForVote }) =>
      apiFetch(sitePath(`/contests/${contestId}/entries/${entryId}/select`), {
        method: "POST",
        json: { selectedForVote },
      }),
  },
  vote: (contestId, { entryId }) =>
    apiFetch(sitePath(`/contests/${contestId}/votes`), {
      method: "POST",
      json: { entryId },
    }),
  tally: (contestId) => apiFetch(sitePath(`/contests/${contestId}/tally`)),
  results: (contestId) => apiFetch(sitePath(`/contests/${contestId}/results`)),
  announceResults: (contestId, data) =>
    apiFetch(sitePath(`/contests/${contestId}/results`), { method: "POST", json: data }),
};

/* ---------- Uploads (R2 presigned PUT + multipart direct) ----------
   backend dto: { purpose: "avatar"|"dnf_capture"|"contest_entry"|"post_attachment"|"hero_banner",
                  contentType, sizeBytes }
   응답: { uploadId, putUrl, r2Key }
   - hero_banner purpose 는 admin 게이트 (backend 측 hasAnyAdminRole 검증)
   - file(): multipart 직접 업로드. CORS / presigned 흐름 회피용. 응답: { upload: {...}, url }
*/

export const uploads = {
  presignedPut: ({ purpose, contentType, sizeBytes }) =>
    apiFetch("/uploads/presigned-put", {
      method: "POST",
      json: { purpose, contentType, sizeBytes },
    }),
  confirm: (id, { sizeBytes } = {}) =>
    apiFetch(`/uploads/${id}/confirm`, { method: "POST", json: { sizeBytes } }),
  file: ({ purpose, file }) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", purpose);
    return apiFetch("/uploads/file", { method: "POST", form: fd });
  },
};

/* ---------- Hero banners (사이트 어드민 inline edit) ----------
   GET = public list (active only). admin 시 ?includeInactive=1 로 inactive 포함.
   POST/PATCH/DELETE = admin only. backend isSiteAdmin(site) 게이트.
*/

export const heroBanners = {
  list: ({ includeInactive } = {}) =>
    apiFetch(sitePath("/hero-banners"), {
      query: { includeInactive: includeInactive ? "1" : undefined },
    }),
  create: ({ imageUrl, linkUrl, label, sortOrder, active }) =>
    apiFetch(sitePath("/hero-banners"), {
      method: "POST",
      json: { imageUrl, linkUrl, label, sortOrder, active },
    }),
  update: (id, input) =>
    apiFetch(sitePath(`/hero-banners/${id}`), { method: "PATCH", json: input }),
  remove: (id) =>
    apiFetch(sitePath(`/hero-banners/${id}`), { method: "DELETE" }),
};

/* ---------- OAuth helpers (browser redirect URL builder) ---------- */

export const oauth = {
  googleStart: (returnTo = "/") =>
    `${API_BASE}/auth/oauth/google/start?site=${SITE}&returnTo=${encodeURIComponent(returnTo)}`,
  kakaoStart: (returnTo = "/") =>
    `${API_BASE}/auth/oauth/kakao/start?site=${SITE}&returnTo=${encodeURIComponent(returnTo)}`,
};
