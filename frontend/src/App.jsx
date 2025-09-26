import React, { useEffect, useRef, useState } from "react";
import Chat, { Bubble, useMessages } from "@chatui/core";
import "@chatui/core/dist/index.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_CHAT_API || "http://localhost:3000/chat";
const BOT = { id: "bot", name: "RTO Assistant" };

// We’re not using ChatUI’s composer, so leave these blank.
const locale = { composer: { placeholder: "", send: "" } };

export default function App() {
  const { messages, appendMsg, updateMsg } = useMessages([]);
  const welcomedOnce = useRef(false);
  const [inputValue, setInputValue] = useState("");

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

  async function sendMessage(text) {
    const q = (text || "").trim();
    if (!q) return;

    appendMsg({ type: "text", content: q, position: "right" });

    const typingId = `typing-${Date.now()}`;
    appendMsg({
      _id: typingId,
      type: "text",
      content: "…",
      position: "left",
      user: BOT,
    });

    try {
      const res = await axios.post(API_URL, { query: q }, { timeout: 20000 });
      const answer = res?.data?.answer || "Sorry, I couldn’t find that.";
      updateMsg(typingId, {
        type: "text",
        content: answer,
        position: "left",
        user: BOT,
      });
    } catch (e) {
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
        {/* Header */}
        <div className="chat-header">
          <div className="chat-brand">
            <div className="chat-avatar">🚦</div>
            <div>
              <div className="chat-title">RTO Appointment Assistant</div>
              <div className="chat-status">
                <span className="dot" /> Online
              </div>
            </div>
          </div>
          <a className="chat-help" href="#" onClick={(e) => e.preventDefault()}>
            Help
          </a>
        </div>

        {/* Scrollable chat body (messages only) */}
        <div className="chat-body">
          <Chat
            className="chat-ui"
            locale={locale}
            messages={messages}
            renderMessageContent={renderMessageContent}
            placeholder=""
            quickReplies={quickReplies}
            onQuickReplyClick={(item) => sendMessage(item.value)}
            // 🔒 Hard-disable any internal composer rendering
            renderComposer={() => null}
          />
        </div>

        {/* Our custom prompt bar (the only composer) */}
        <div className="custom-composer">
          <input
            className="composer-input"
            type="text"
            placeholder="Type your question…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(inputValue);
                setInputValue("");
              }
            }}
          />
          <button
            className="composer-btn"
            onClick={() => {
              sendMessage(inputValue);
              setInputValue("");
            }}
          >
            Send
          </button>
        </div>

        {/* Footer */}
        <div className="chat-footer">Powered by RTO Queue System</div>
      </div>
    </div>
  );
}
