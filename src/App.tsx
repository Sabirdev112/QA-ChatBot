import React, { useEffect, useRef } from 'react';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { ChatHistory } from './components/ChatHistory';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';

function App() {
  const {
    sessions,
    currentChatId,
    onNewChat,
    onSwitchChat,
    onDeleteChat,
    messages,
    input,
    setInput,
    isTyping,
    isGenerating,
    model,
    setModel,
    projectName,
    setProjectName,
    generationLog,
    handleSend,
    handleStop,
    models
  } = useChat();

  const mainRef = useRef<HTMLElement>(null);

  const prevMessagesLength = useRef(messages.length);

  // Smart Auto-Scroll: Only if at bottom OR a brand new message just started
  useEffect(() => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 200;
      const isNewMessage = messages.length > prevMessagesLength.current;
      
      if (isAtBottom || isNewMessage) {
        requestAnimationFrame(() => {
          mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight + 200, behavior: 'smooth' });
        });
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages]);

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar 
        projectName={projectName}
        setProjectName={setProjectName}
        model={model}
        setModel={setModel}
        models={models}
        setInput={setInput}
      />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          generationLog={generationLog} 
          scrollRef={mainRef as React.RefObject<HTMLDivElement>} 
        />
        <InputArea 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleStop={handleStop}
          isTyping={isTyping}
          isGenerating={isGenerating}
        />
      </main>
      <ChatHistory 
        sessions={sessions}
        currentChatId={currentChatId}
        onSwitchChat={onSwitchChat}
        onDeleteChat={onDeleteChat}
        onNewChat={onNewChat}
      />
    </div>
  );
}

export default App;
