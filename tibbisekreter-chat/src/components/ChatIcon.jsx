import React from 'react';
import './ChatPopup.css';

// Chat ikon bileşeni
// onClick: ikon tıklanınca tetiklenen fonksiyon
// hasNewMessage: yeni mesaj bildirimi olup olmadığını belirten boolean
const ChatIcon = ({ onClick, hasNewMessage }) => {
  return (
    <div 
      className={`chat-icon ${hasNewMessage ? 'pulse' : ''}`} 
      onClick={onClick} 
      role="button" 
      aria-label="Open chat popup"
    >
      💬
      {hasNewMessage && (
        <div className="notification-badge" aria-label="Yeni mesaj var">
          1
        </div>
      )}
    </div>
  );
};

export default ChatIcon;
