"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function Page() {
  const [input, setInput] = useState("");

  const { messages, append, isLoading, error, stop } = useChat({
    api: "/api/chat",
  });

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Qwen Chat (HF Router)</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 360, whiteSpace: "pre-wrap" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {m.role === "user" ? "You" : "Assistant"}
            </div>
            <div>{m.content}</div>
          </div>
        ))}
        {error ? <div style={{ color: "crimson" }}>{String(error.message ?? error)}</div> : null}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text) return;
          setInput("");
          await append({ role: "user", content: text });
        }}
        style={{ marginTop: 16, display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息…"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: "10px 14px" }}>
          Send
        </button>
        <button type="button" onClick={() => stop()} disabled={!isLoading} style={{ padding: "10px 14px" }}>
          Stop
        </button>
      </form>
    </main>
  );
}