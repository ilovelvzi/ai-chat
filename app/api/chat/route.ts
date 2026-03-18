import { NextResponse } from "next/server";

// 在 Node 运行时下，我们可以用 undici 设置代理
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const baseUrl = process.env.HF_BASE_URL || "https://router.huggingface.co/v1";
  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";
  const proxy = process.env.HF_PROXY;

  if (!token) {
    return NextResponse.json({ error: "Missing HF_TOKEN" }, { status: 500 });
  }

  // 可选：显式代理（仅在你需要本地代理时启用）
  if (proxy) {
    const { ProxyAgent, setGlobalDispatcher } = await import("undici");
    setGlobalDispatcher(new ProxyAgent(proxy));
  }

  const payload = {
    model,
    // 你也可以把 system 作为第一条 message 插进去：
    messages: [
      { role: "system", content: "你是一个严谨、简洁的中文助手。" },
      ...messages,
    ],
    temperature: 0.2,
    max_tokens: 800,
    stream: true,
  };

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: "Upstream error", status: upstream.status, body: text },
      { status: 502 }
    );
  }

  // 关键：把 SSE 流透传给前端
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
