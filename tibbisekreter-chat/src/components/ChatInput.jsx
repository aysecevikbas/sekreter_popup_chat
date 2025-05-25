import React from 'react';

function ChatInput({ input, setInput, handleSend, isSending }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSending) {
      handleSend();
    }
  };

  return (
    <>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Mesajınızı yazın..."
        disabled={isSending}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isSending}
      >
        {isSending ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </>
  );
}

export default ChatInput;
