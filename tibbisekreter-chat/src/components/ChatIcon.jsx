import React from 'react';
import './ChatPopup.css';

function ChatIcon({ onClick, hasNewMessage }) {
  return (
    <div className={`chat-icon ${hasNewMessage ? 'pulse' : ''}`} onClick={onClick}>
      💬
      {hasNewMessage && <div className="notification-badge">1</div>}
    </div>
  );
}

export default ChatIcon;
