import React, { useState } from 'react';

// Helper to render message content with clickable links if present
function renderMessageContent(content: string) {
  // Simple regex to match [text](url) markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <a href={match[2]} target="_blank" rel="noopener noreferrer" key={key++} style={{ color: '#4F40EE', textDecoration: 'underline' }}>
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts;
}

const Chat = ({ onSendMessage, messages, loading }) => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <>
      {/* Floating chat button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            background: '#4F40EE',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 28,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
      {/* Popup chat box */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            zIndex: 1001,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 16,
            maxWidth: 400,
            width: '100%',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>AI Chat</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 8, flex: 1 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ margin: '8px 0', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <span style={{ background: msg.role === 'user' ? '#e0f7fa' : '#f1f8e9', padding: 8, borderRadius: 4 }}>
                  {typeof msg.content === 'string' ? renderMessageContent(msg.content) : msg.content}
                </span>
              </div>
            ))}
            {loading && <div>AI is typing...</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} style={{ padding: '8px 16px' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
