/**
 * api-client.js — allow.dnfm.kr → api.dnfm.kr
 *
 * 공통 fetch wrapper.
 *   - base = NEXT_PUBLIC_API_BASE 또는 https://api.dnfm.kr (prod 기본)
 *   - credentials: "include" — 쿠키 도메인은 .dnfm.kr 이라 같은 sub-domain 공유
 *   - JSON body 자동 직렬화 / Content-Type 자동
 *   - 응답이 JSON 이 아닐 수도 있어 try-catch
 *   - 4xx/5xx 는 에러로 throw — { status, code, message, payload }
 */

const DEFAULT_BASE = "https://api.dnfm.kr";

function resolveBase() {
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE.replace(/\/+$/, "");
  }
  return DEFAULT_BASE;
}

export const API_BASE = resolveBase();

export class ApiError extends Error {
  constructor({ status, code, message, payload }) {
    super(message || `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 저수준 호출.
 * @param {string} path - "/auth/me" 같은 경로
 * @param {RequestInit & { json?: any, query?: Record<string, any> }} init
 */
export async function apiFetch(path, init = {}) {
  const { json, query, headers, body, ...rest } = init;
  let url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  if (query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      qs.set(k, String(v));
    }
    const qstr = qs.toString();
    if (qstr) url += (url.includes("?") ? "&" : "?") + qstr;
  }

  const finalHeaders = new Headers(headers || {});
  let finalBody = body;
  if (json !== undefined) {
    finalHeaders.set("content-type", "application/json");
    finalBody = JSON.stringify(json);
  }

  let res;
  try {
    res = await fetch(url, {
      ...rest,
      credentials: "include",
      headers: finalHeaders,
      body: finalBody,
    });
  } catch (err) {
    throw new ApiError({
      status: 0,
      code: "network_error",
      message: err?.message || "네트워크 오류",
      payload: null,
    });
  }

  const payload = await parseBody(res);

  if (!res.ok) {
    const code =
      (payload && typeof payload === "object" && (payload.code || payload.error)) ||
      `http_${res.status}`;
    const message =
      (payload && typeof payload === "object" && (payload.message || payload.detail)) ||
      (typeof payload === "string" ? payload : null) ||
      `HTTP ${res.status}`;
    throw new ApiError({ status: res.status, code, message, payload });
  }

  return payload;
}

/* ---------- Auth ---------- */

export const auth = {
  me: () => apiFetch("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  loginLocal: ({ username, password }) =>
    apiFetch("/auth/login/local", { method: "POST", json: { username, password } }),
  signupLocal: ({ username, password, displayName, email, dnfProfile, site = "allow" }) =>
    apiFetch("/auth/signup/local", {
      method: "POST",
      json: { username, password, displayName, email, dnfProfile, site },
    }),
  checkAvailability: ({ username, displayName }) =>
    apiFetch("/auth/check-availability", {
      method: "POST",
      json: { username, displayName },
    }),
  ocrDnfProfile: ({ type, fileUrl }) =>
    apiFetch(`/auth/dnf-profile/ocr/${type}`, { method: "POST", json: { fileUrl } }),
  confirmDnfProfile: (data) =>
    apiFetch("/auth/dnf-profile/confirm", { method: "POST", json: data }),
};

/* ---------- Posts (board) ---------- */

export const posts = {
  list: ({ category, page, q } = {}) =>
    apiFetch("/sites/allow/posts", { query: { category, page, q } }),
  detail: (id) => apiFetch(`/sites/allow/posts/${id}`),
  create: ({ category, title, body, imageUrl }) =>
    apiFetch("/sites/allow/posts", {
      method: "POST",
      json: { category, title, body, imageUrl },
    }),
  vote: (id, value = 1) =>
    apiFetch(`/sites/allow/posts/${id}/vote`, { method: "POST", json: { value } }),
  comments: {
    list: (postId) => apiFetch(`/sites/allow/posts/${postId}/comments`),
    create: (postId, { body }) =>
      apiFetch(`/sites/allow/posts/${postId}/comments`, {
        method: "POST",
        json: { body },
      }),
  },
};

/* ---------- Contests ---------- */

export const contests = {
  list: () => apiFetch("/sites/allow/contests"),
  detail: (id) => apiFetch(`/sites/allow/contests/${id}`),
  create: (data) =>
    apiFetch("/sites/allow/contests", { method: "POST", json: data }),
  entries: {
    list: (contestId) => apiFetch(`/sites/allow/contests/${contestId}/entries`),
    create: (contestId, data) =>
      apiFetch(`/sites/allow/contests/${contestId}/entries`, {
        method: "POST",
        json: data,
      }),
    selectForVote: (contestId, entryId, { selected }) =>
      apiFetch(
        `/sites/allow/contests/${contestId}/entries/${entryId}/select`,
        { method: "POST", json: { selected } },
      ),
  },
  vote: (contestId, { entryId }) =>
    apiFetch(`/sites/allow/contests/${contestId}/votes`, {
      method: "POST",
      json: { entryId },
    }),
  results: (contestId) =>
    apiFetch(`/sites/allow/contests/${contestId}/results`),
  publishResults: (contestId, data) =>
    apiFetch(`/sites/allow/contests/${contestId}/results`, {
      method: "POST",
      json: data,
    }),
  updateStatus: (contestId, { status }) =>
    apiFetch(`/sites/allow/contests/${contestId}/status`, {
      method: "POST",
      json: { status },
    }),
};

/* ---------- Uploads (R2 presigned PUT) ---------- */

export const uploads = {
  presignedPut: ({ filename, contentType, scope = "allow" }) =>
    apiFetch("/uploads/presigned-put", {
      method: "POST",
      json: { filename, contentType, scope },
    }),
};

/* ---------- OAuth helpers ---------- */

export const oauth = {
  googleStart: (returnTo = "/") =>
    `${API_BASE}/auth/google/start?site=allow&returnTo=${encodeURIComponent(returnTo)}`,
  kakaoStart: (returnTo = "/") =>
    `${API_BASE}/auth/kakao/start?site=allow&returnTo=${encodeURIComponent(returnTo)}`,
};
