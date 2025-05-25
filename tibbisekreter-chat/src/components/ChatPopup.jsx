import React, { useState } from 'react';
import ChatIcon from './ChatIcon';
import ChatInput from './ChatInput';
import './ChatPopup.css';

function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const playNotificationSound = () => {
    const audio = new Audio(process.env.PUBLIC_URL + "/sounds/oringz-w427-371.mp3");
    audio.play().catch(e => console.error("Ses çalınamadı:", e));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsSending(true);

    const newMessages = [...messages, { sender: "Siz", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("/chat", {  // 🔁 burada güncellendi
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });

      const data = await response.json();
      const reply = data.reply;

      let currentText = "";
      let index = 0;

      const typeNextChar = () => {
        if (index < reply.length) {
          currentText += reply[index];
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.sender === "Asistan") {
              updated[updated.length - 1] = { ...last, text: currentText };
            } else {
              updated.push({ sender: "Asistan", text: currentText });
            }
            return updated;
          });
          index++;
          setTimeout(typeNextChar, 40);
        }
      };

      playNotificationSound();
      setHasNewMessage(true);
      typeNextChar();

    } catch {
      setMessages(prev => [...prev, { sender: "Asistan", text: "Sunucuya bağlanılamadı." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <ChatIcon onClick={toggleChat} hasNewMessage={hasNewMessage} />
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.sender === "Siz" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isSending={isSending}
          />
        </div>
      )}
    </>
  );
}

export default ChatPopup;
