"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, auth } from "@/lib/api-client";

const REFRESH_CHECK_KEY = "hurock:last-refresh-check";
const REFRESH_CHECK_TTL_MS = 60_000;

function unwrapAuthUser(data) {
  if (!data) return null;
  if (Object.prototype.hasOwnProperty.call(data, "user")) {
    return data.user || null;
  }
  return data;
}

function shouldTrySessionRefresh() {
  if (typeof window === "undefined") return true;
  try {
    const last = Number(window.sessionStorage.getItem(REFRESH_CHECK_KEY) || 0);
    if (last && Date.now() - last < REFRESH_CHECK_TTL_MS) return false;
    window.sessionStorage.setItem(REFRESH_CHECK_KEY, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

/**
 * useCurrentUser — 로그인 상태 + dnfProfile.
 *
 *   const { user, loading, error, refresh, logout } = useCurrentUser();
 *
 * user 모양 (backend 약속):
 *   {
 *     id, username, displayName,
 *     site, role ("user" | "admin" | "superadmin"),
 *     dnfProfile?: { adventureName, characterName, serverName, ... }
 *   }
 *
 * 미로그인 시 user=null, error=null.
 * 네트워크/서버 에러는 error 에 담아서 각 페이지가 빈 상태/안내를 결정.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const readCurrentUser = useCallback(async () => {
    try {
      const data = await auth.me();
      const current = unwrapAuthUser(data);
      if (current) return current;
      if (!shouldTrySessionRefresh()) return null;
      const refreshed = await auth.refresh().catch(() => null);
      return refreshed?.user || null;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        const canRefresh = new Set([
          "session_expired",
          "session_invalid",
          "token_version_mismatch",
        ]).has(err.code);
        if (!canRefresh || !shouldTrySessionRefresh()) return null;
        const refreshed = await auth.refresh().catch(() => null);
        return refreshed?.user || null;
      }
      throw err;
    }
  }, []);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await readCurrentUser();
      setUser(current);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setUser(null);
      } else {
        setUser(null);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [readCurrentUser]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const current = await readCurrentUser();
        if (!alive) return;
        setUser(current);
        setError(null);
      } catch (err) {
        if (!alive) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setUser(null);
        } else {
          setUser(null);
          setError(err);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [readCurrentUser]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      /* 무시 — 클라이언트 상태만 비움 */
    }
    setUser(null);
  }, []);

  return { user, loading, error, refresh: fetchMe, logout };
}

const ADMIN_ROLES = new Set(["admin", "super"]);

/**
 * 사이트별 admin 권한 확인. backend /auth/me 의 user.siteRoles 를 본다.
 *   user.siteRoles = [{ site: "newb"|"hurock"|"*", role: "member"|"admin"|"super" }]
 *
 * 호환: 옛 user.role ("admin" / "superadmin") 도 지원.
 */
export function isAdmin(user, site = "hurock") {
  if (!user) return false;
  if (user.role === "admin" || user.role === "superadmin" || user.role === "super") {
    return true;
  }
  const roles = Array.isArray(user.siteRoles) ? user.siteRoles : [];
  for (const r of roles) {
    if (!r || !r.role) continue;
    if (!ADMIN_ROLES.has(r.role)) continue;
    if (r.site === "*") return true;
    if (r.site === site) return true;
  }
  return false;
}

export function isSuperAdmin(user) {
  if (!user) return false;
  if (user.role === "superadmin" || user.role === "super") return true;
  const roles = Array.isArray(user.siteRoles) ? user.siteRoles : [];
  return roles.some((r) => r && r.role === "super");
}
