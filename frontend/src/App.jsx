import React from "react";
import Chat, { Bubble, useMessages } from "@chatui/core";
import "@chatui/core/dist/index.css";
import axios from "axios";

const API_URL = "http://localhost:3000/chat"; 

function App() {
  const { messages, appendMsg, updateMsg } = useMessages();

  function renderMessageContent(msg) {
    return <Bubble content={msg.content} />;
  }

  async function handleSend(type, val) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: val,
        position: "right",
      });

      const typingId = `typing-${Date.now()}`;
      appendMsg({
        _id: typingId,
        type: "text",
        content: "⏳ Typing...",
        position: "left",
      });

      try {
        const res = await axios.post(API_URL, { query: val });
        const answer = res.data.answer;

        updateMsg(typingId, {
          type: "text",
          content: answer,
          position: "left",
        });
      } catch (err) {
        updateMsg(typingId, {
          type: "text",
          content: "⚠️ Error connecting to server",
          position: "left",
        });
      }
    }
  }

  return (
  <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  }}
>
  <div
    style={{
      width: "500px",
      height: "700px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      borderRadius: "10px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Chat
      navbar={{ title: "🚦 RTO Appointment Assistant" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
      placeholder="Type your query about RTO services..."
      style={{ flex: 1 }}  
    />
  </div>
</div>


  );
}

export default App;
