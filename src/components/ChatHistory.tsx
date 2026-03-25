import React from 'react';
import { ChatSession } from '../types/chat';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentChatId: string;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentChatId,
  onSwitchChat,
  onDeleteChat,
  onNewChat,
}) => {
  return (
    <aside className="chat-history-sidebar glass-card" style={{ width: '280px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRadius: 0, padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📜</span> History
        </h2>
        <button 
          onClick={onNewChat}
          className="glass-card"
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white', background: 'linear-gradient(135deg, var(--accent), var(--primary))', border: 'none' }}
          title="New Chat"
        >
          ➕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
        {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map((session) => (
          <div 
            key={session.id} 
            className="glass-card"
            style={{ 
              padding: '0.75rem', 
              cursor: 'pointer', 
              border: session.id === currentChatId ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
              background: session.id === currentChatId ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
            onClick={() => onSwitchChat(session.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: session.id === currentChatId ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                {session.title}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.25rem' }}
                title="Delete Chat"
              >
                🗑️
              </button>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {new Date(session.updatedAt).toLocaleDateString()} {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2rem' }}>
            No chat history yet.
          </div>
        )}
      </div>
    </aside>
  );
};
