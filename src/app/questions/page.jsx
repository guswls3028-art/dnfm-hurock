"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import PageShell from "@/components/PageShell";
import StickerBadge from "@/components/StickerBadge";
import { broadcast } from "@/lib/api-client";
import { useCurrentUser } from "@/lib/use-current-user";

const CATEGORIES = [
  { value: "general", label: "일반 질문" },
  { value: "dnf", label: "던파 질문" },
  { value: "contest", label: "이벤트 질문" },
  { value: "consulting", label: "컨설팅" },
];

export default function QuestionsPage() {
  const { user } = useCurrentUser();
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const displayName = user?.displayName || user?.username || "";
      const data = await broadcast.questions.create({
        nickname: nickname || displayName || undefined,
        category,
        content,
        imageR2Key: images[0],
      });
      setDone(data?.question || data);
      setContent("");
      setImages([]);
    } catch (err) {
      setError(err?.message || "질문 접수에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell activePath="/questions">
      <div className="page-head">
        <div>
          <h1>
            방송 Q&A <StickerBadge tone="cyan" rotate="r">질문 접수</StickerBadge>
          </h1>
          <p>방송에서 다룰 질문을 남겨 주세요. 운영자가 선별하면 방송 화면에 올라갑니다.</p>
        </div>
      </div>

      <section className="section" aria-labelledby="question-submit">
        <div className="section-head">
          <h2 id="question-submit">질문 남기기</h2>
        </div>
        <form className="form-block" onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <label className="form-row">
              <span>닉네임</span>
              <input
                className="form-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={user?.displayName || "익명 가능"}
                maxLength={32}
              />
            </label>
            <label className="form-row">
              <span>분류</span>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="form-row">
            <span>질문</span>
            <textarea
              className="form-textarea"
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="방송에서 물어볼 내용을 적어 주세요."
              required
              maxLength={1000}
            />
            <small>{content.length}/1000</small>
          </label>
          <label className="form-row">
            <span>첨부 이미지</span>
            {user ? (
              <ImageUploader value={images} onChange={setImages} max={1} />
            ) : (
              <div className="callout-box">
                <strong>로그인 필요</strong>
                이미지를 첨부하려면 로그인 후 접수해 주세요. 텍스트 질문은 바로 접수할 수 있습니다.
              </div>
            )}
          </label>
          {error ? (
            <div className="callout-box is-pending">
              <strong>접수 실패</strong>
              {error}
            </div>
          ) : null}
          {done ? (
            <div className="callout-box">
              <strong>접수 완료</strong>
              질문이 운영자 큐에 들어갔습니다.
            </div>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={busy || !content.trim()}>
            {busy ? "접수 중" : "질문 접수"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}
