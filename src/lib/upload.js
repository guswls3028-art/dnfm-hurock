/**
 * upload.js — R2 presigned PUT 흐름.
 *
 *   const url = await uploadFile(file, { scope: "contest-entry" });
 *
 * 1) backend /uploads/presigned-put 호출 → { putUrl, publicUrl, fields? }
 * 2) putUrl 에 PUT (Content-Type 일치)
 * 3) publicUrl 반환 (이후 DB 저장용)
 */

import { ApiError, uploads } from "@/lib/api-client";

export async function uploadFile(file, { scope = "allow" } = {}) {
  if (!file) throw new Error("파일이 비어 있습니다");

  const presign = await uploads.presignedPut({
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    scope,
  });

  const putUrl = presign?.putUrl || presign?.url;
  const publicUrl = presign?.publicUrl || presign?.publicURL || presign?.cdnUrl;

  if (!putUrl) {
    throw new ApiError({
      status: 0,
      code: "presign_missing_put_url",
      message: "presigned PUT URL 응답이 비어 있습니다",
      payload: presign,
    });
  }

  const res = await fetch(putUrl, {
    method: "PUT",
    headers: { "content-type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: "r2_put_failed",
      message: `R2 업로드 실패 (HTTP ${res.status})`,
      payload: null,
    });
  }

  return publicUrl || putUrl.split("?")[0];
}
