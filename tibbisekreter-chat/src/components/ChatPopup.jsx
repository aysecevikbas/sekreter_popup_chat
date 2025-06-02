import React, { useState, useEffect, useRef } from 'react';
import ChatIcon from './ChatIcon';
import ChatInput from './ChatInput';
import './ChatPopup.css';

const ChatPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setHasNewMessage(false);
  };

  const playNotificationSound = () => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/oringz-w427-371.mp3`);
    audio.play().catch(e => console.error('Ses çalınamadı:', e));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsSending(true);

    const apiUrl = process.env.REACT_APP_API_URL || '';
    const userMessage = { sender: 'Siz', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const reply = data.reply;

      setMessages(prev => [...prev, { sender: 'Asistan', text: '' }]);

      let currentText = '';
      let index = 0;

      const typeNextChar = () => {
        if (index < reply.length) {
          currentText += reply[index];
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = currentText;
            return updated;
          });
          index++;
          setTimeout(typeNextChar, 40);
        }
      };

      playNotificationSound();
      setHasNewMessage(true);
      typeNextChar();

    } catch (error) {
      console.error('Hata:', error);
      setMessages(prev => [...prev, { sender: 'Asistan', text: 'Sunucuya bağlanılamadı.' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <ChatIcon onClick={toggleChat} hasNewMessage={hasNewMessage} />
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === 'Siz' ? 'user' : 'bot'}`}>
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
};

export default ChatPopup;
