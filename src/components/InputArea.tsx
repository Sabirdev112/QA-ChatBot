
import React, { useRef, useEffect } from 'react';

interface InputAreaProps {
  input: string;
  setInput: (i: string) => void;
  handleSend: () => void;
  handleStop: () => void;
  isTyping: boolean;
  isGenerating: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  input, 
  setInput, 
  handleSend, 
  handleStop, 
  isTyping, 
  isGenerating 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Set to scrollHeight, cap at maxHeight (12rem = 192px approx)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating) handleSend();
    }
  };

  return (
    <footer className="input-area">
      <div className="glass-card" style={{ display: 'flex', padding: '0.5rem 1rem', alignItems: 'flex-end', gap: '1rem', boxShadow: 'var(--shadow-md)' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Describe your user story or QA requirement..."
          disabled={isGenerating}
          rows={1}
          style={{ 
            flex: 1, 
            background: 'transparent', 
            color: 'white', 
            padding: '0.75rem 0', 
            resize: 'none',
            minHeight: '2.5rem',
            maxHeight: '12rem',
            overflowY: 'auto',
            opacity: isGenerating ? 0.6 : 1
          }}
        />
        {isGenerating ? (
          <button 
            onClick={handleStop}
            className="glass-card"
            style={{ 
              background: '#ef4444',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.2rem',
              animation: 'pulse 2s infinite'
            }}
          >
            Stop
          </button>
        ) : (
          <button 
            onClick={handleSend}
            disabled={isTyping}
            style={{ 
              background: isTyping ? 'var(--text-muted)' : 'var(--primary)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.2rem',
              opacity: input.trim() ? 1 : 0.5
            }}
          >
            Send
          </button>
        )}
      </div>
    </footer>
  );
};
