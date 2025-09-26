import React, { useEffect, useRef } from "react";
import Chat, { Bubble, useMessages } from "@chatui/core";
import "@chatui/core/dist/index.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_CHAT_API || "http://localhost:3000/chat";
const BOT = { id: "bot", name: "RTO Assistant" };

// ✅ Minimal English locale override (no external import needed)
const locale = {
  composer: {
    placeholder: "Type your question…",
    send: "Send",
  },
};

export default function App() {
  const { messages, appendMsg, updateMsg } = useMessages([]);
  const welcomedOnce = useRef(false); // prevents double welcome in React strict mode

  useEffect(() => {
    if (!welcomedOnce.current) {
      welcomedOnce.current = true;
      appendMsg({
        type: "text",
        content:
          "👋 Hi! I’m your RTO Assistant.\nAsk me about required documents, slot availability, fees, rescheduling, and more.",
        position: "left",
        user: BOT,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMessageContent(msg) {
    return (
      <Bubble>
        <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
      </Bubble>
    );
  }

  async function handleSend(type, val) {
    if (type !== "text") return;
    const text = String(val || "").trim();
    if (!text) return;

    appendMsg({ type: "text", content: text, position: "right" });

    const typingId = `typing-${Date.now()}`;
    appendMsg({ _id: typingId, type: "text", content: "…", position: "left", user: BOT });

    try {
      const res = await axios.post(API_URL, { query: text }, { timeout: 15000 });
      const answer = res?.data?.answer || "Sorry, I couldn’t find that.";
      updateMsg(typingId, { type: "text", content: answer, position: "left", user: BOT });
    } catch {
      updateMsg(typingId, {
        type: "text",
        content: "⚠️ Unable to reach the server. Please try again.",
        position: "left",
        user: BOT,
      });
    }
  }

  const quickReplies = [
    { name: "📅 Slots today", value: "What slots are available today?" },
    { name: "🧾 Documents", value: "What documents are required for LMV-NT?" },
    { name: "💳 Fees", value: "What are the fees for the driving test?" },
    { name: "🔄 Reschedule", value: "How do I reschedule my slot?" },
    { name: "♿ Priority", value: "How do you prioritize applicants with disabilities?" },
    { name: "☎️ Contact", value: "How can I contact the RTO?" },
  ];

  return (
    <div className="chat-root">
      <div className="chat-card">
        <div className="chat-header">
          <div className="chat-brand">
            <div className="chat-avatar">🚦</div>
            <div>
              <div className="chat-title">RTO Appointment Assistant</div>
              <div className="chat-status"><span className="dot" /> Online</div>
            </div>
          </div>
          <a className="chat-help" href="#" onClick={(e) => e.preventDefault()}>
            Help
          </a>
        </div>

        <Chat
          className="chat-ui"
          style={{ height: '100%' }}
          locale={locale}               // 👈 send button now shows “Send”
          messages={messages}
          renderMessageContent={renderMessageContent}
          onSend={handleSend}
          quickReplies={quickReplies}
          onQuickReplyClick={(item) => handleSend("text", item.value)}
          placeholder="Type your question…"
        />

        <div className="chat-footer">Powered by RTO Queue System</div>
      </div>
    </div>
  );
}
