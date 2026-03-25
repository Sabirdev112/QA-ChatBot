
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  generationLog: string[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, generationLog, scrollRef }) => {
  return (
    <div className="messages-container" ref={scrollRef}>
      {messages.map((msg, i) => {
        const hasTable = msg.role === 'assistant' && msg.content.includes('|');
        
        const copyToClipboard = (text: string, id: string, successText: string, defaultText: string) => {
          navigator.clipboard.writeText(text);
          const btn = document.getElementById(id);
          if (btn) btn.innerText = successText;
          setTimeout(() => { if (btn) btn.innerText = defaultText; }, 2000);
        };

        const markdownTableToTsv = (content: string): string => {
          const lines = content.split('\n');
          return lines
            .filter(line => line.trim().startsWith('|'))
            .filter(line => !line.match(/^\|[ \-:|]+\|$/)) 
            .map(line => {
              // Replace <br> with a space for Excel-friendly copying
              const cleanLine = line.replace(/<br\s*\/?>/gi, ' ');
              return cleanLine.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()).join('\t');
            })
            .join('\r\n');
        };

        return (
          <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`} style={{ position: 'relative' }}>
            {msg.role === 'assistant' && msg.content && (
              <div style={{ position: 'absolute', top: '-0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <button 
                  onClick={() => {
                    const textToCopy = hasTable ? markdownTableToTsv(msg.content) : msg.content;
                    copyToClipboard(textToCopy, `copy-${i}`, '✅ Copied!', '📋 Copy');
                  }}
                  id={`copy-${i}`}
                  className="glass-card"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: 0.8 }}
                >
                  📋 Copy
                </button>
              </div>
            )}
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              table: ({ ...props }) => <div style={{ overflowX: 'auto' }}><table {...props} /></div>,
              code({className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <pre>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {msg.content}
          </ReactMarkdown>
          <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            {msg.timestamp}
          </div>
        </div>
        );
      })}
      {isTyping && (
        <div className="message bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          Calculating optimal QA strategy...
        </div>
      )}
      {generationLog.length > 0 && (
        <div className="glass-card" style={{ margin: '1rem 0', padding: '1rem', borderLeft: '4px solid var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }} />
            File Generation Log (D:\projects)
          </h4>
          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', maxHeight: '150px', overflowY: 'auto' }}>
            {generationLog.map((log, i) => (
              <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
