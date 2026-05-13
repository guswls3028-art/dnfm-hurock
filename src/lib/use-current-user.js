"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, auth } from "@/lib/api-client";

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
 * 네트워크/서버 에러는 error 에 담아서 — 페이지가 mock fallback 결정.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auth.me();
      setUser(data?.user || data || null);
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
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await auth.me();
        if (!alive) return;
        setUser(data?.user || data || null);
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
  }, []);

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
