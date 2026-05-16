"use client";

import { useEffect, useState } from "react";
import { broadcast, buildApiUrl } from "@/lib/api-client";

function formatCategory(value) {
  const map = {
    general: "일반",
    dnf: "던파",
    contest: "이벤트",
    consulting: "컨설팅",
  };
  return map[value] || value || "질문";
}

export default function BroadcastQuestionLivePage() {
  const [question, setQuestion] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const data = await broadcast.questions.live();
        if (alive) {
          setQuestion(data?.question || null);
          setLoaded(true);
        }
      } catch {
        if (alive) setLoaded(true);
      }
    }
    load();
    const id = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08090b",
        color: "#f8fafc",
        display: "grid",
        placeItems: "center",
        padding: 48,
        fontFamily: "Pretendard, system-ui, sans-serif",
      }}
    >
      {question ? (
        <section
          style={{
            width: "min(1100px, 100%)",
            border: "4px solid rgba(255,255,255,.9)",
            borderRadius: 18,
            padding: 36,
            background: "rgba(16,18,24,.92)",
            boxShadow: "0 24px 80px rgba(0,0,0,.55)",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <strong
              style={{
                background: "#67e8f9",
                color: "#08111a",
                borderRadius: 999,
                padding: "10px 18px",
                fontSize: 24,
              }}
            >
              {formatCategory(question.category)}
            </strong>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#facc15" }}>
              {question.nickname || "익명"}
            </span>
          </div>
          <p style={{ fontSize: "clamp(38px, 6vw, 76px)", lineHeight: 1.16, fontWeight: 900, margin: 0 }}>
            {question.content}
          </p>
          {question.imageR2Key ? (
            <img
              src={buildApiUrl(`/uploads/r2/${encodeURIComponent(question.imageR2Key)}`)}
              alt=""
              style={{ maxWidth: "100%", maxHeight: "38vh", objectFit: "contain", marginTop: 28, borderRadius: 12 }}
            />
          ) : null}
        </section>
      ) : (
        <section style={{ textAlign: "center", opacity: loaded ? 0.86 : 0.45 }}>
          <h1 style={{ fontSize: 52, margin: 0 }}>방송 질문 대기중</h1>
          <p style={{ fontSize: 24, color: "#cbd5e1" }}>운영자가 질문을 방송 표시로 올리면 여기에 표시됩니다.</p>
        </section>
      )}
    </main>
  );
}
