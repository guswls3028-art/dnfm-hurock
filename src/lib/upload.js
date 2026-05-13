/**
 * upload.js — R2 presigned PUT 흐름.
 *
 *   const { r2Key } = await uploadFile(file, { purpose: "contest_entry" });
 *
 * 1) backend /uploads/presigned-put 으로 { purpose, contentType, sizeBytes } 보내
 *    → { uploadId, putUrl, r2Key } 받음
 * 2) putUrl 에 PUT (Content-Type 일치)
 * 3) backend /uploads/:id/confirm 으로 status pending → ready 전환
 * 4) r2Key 반환 — 호출자가 DB 저장용 키로 사용
 *
 * 주의: R2 bucket 은 public 차단. 표시 시 backend presigned GET 필요 (다음 cycle).
 */

import { ApiError, uploads } from "@/lib/api-client";

const UPLOAD_PURPOSES = ["avatar", "dnf_capture", "contest_entry", "post_attachment"];

export async function uploadFile(file, { purpose }) {
  if (!file) throw new Error("파일이 비어 있습니다");
  if (!UPLOAD_PURPOSES.includes(purpose)) {
    throw new Error(`unknown upload purpose: ${purpose}`);
  }

  const presign = await uploads.presignedPut({
    purpose,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  const { uploadId, putUrl, r2Key } = presign || {};
  if (!putUrl || !uploadId || !r2Key) {
    throw new ApiError({
      status: 0,
      code: "presign_response_invalid",
      message: "presigned PUT 응답 형식이 비정상입니다.",
      raw: presign,
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
    });
  }

  // status pending → ready 전환 (백엔드 audit 용).
  try {
    await uploads.confirm(uploadId, { sizeBytes: file.size });
  } catch (err) {
    // confirm 실패는 치명적이지 않음 (R2 자체는 업로드 완료). 운영 audit 만 영향.
    if (typeof console !== "undefined" && console.warn) {
      console.warn("upload confirm failed", err);
    }
  }

  return { uploadId, r2Key };
}
