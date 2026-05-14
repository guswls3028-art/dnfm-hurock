/**
 * upload.js — R2 업로드 (backend multipart proxy 방식).
 *
 *   const { r2Key } = await uploadFile(file, { purpose: "contest_entry" });
 *
 * Flow: client → backend `/uploads/file` (multipart) → backend 가 R2 에 직접 PUT
 *   - presigned PUT 방식은 R2 bucket CORS 설정 필요 (CORS preflight 차단 빈발)
 *   - multipart 방식은 backend 가 R2 와 server-to-server 통신 → CORS 무관
 *
 * 응답: { upload: { id, r2Key, sizeBytes, ... }, url } 형태.
 */

import { ApiError, uploads } from "@/lib/api-client";

const UPLOAD_PURPOSES = ["avatar", "dnf_capture", "contest_entry", "post_attachment", "hero_banner"];

export async function uploadFile(file, { purpose }) {
  if (!file) throw new Error("파일이 비어 있습니다");
  if (!UPLOAD_PURPOSES.includes(purpose)) {
    throw new Error(`unknown upload purpose: ${purpose}`);
  }

  const resp = await uploads.file({ purpose, file });
  const upload = resp?.upload || resp;
  const r2Key = upload?.r2Key || resp?.r2Key;
  const uploadId = upload?.id || upload?.uploadId || resp?.uploadId;
  if (!r2Key || !uploadId) {
    throw new ApiError({
      status: 0,
      code: "upload_response_invalid",
      message: "업로드 응답 형식이 비정상입니다.",
      raw: resp,
    });
  }

  return { uploadId, r2Key };
}
