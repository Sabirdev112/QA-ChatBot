
import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession } from '../types/chat';
import { streamChatMessage, ChatMessage } from '../services/llmService';
import { SYSTEM_PROMPT } from '../constants/prompts';
import { MODELS } from '../constants/models';
import { autoSaveToDisk } from '../utils/fileParser';

const generateId = () => Math.random().toString(36).substring(2, 9);
const defaultMessages: Message[] = [
  {
    role: 'assistant',
    content: 'Hello! I am your Senior QA Automation Assistant. How can I help you today?',
    timestamp: new Date().toLocaleTimeString(),
  },
];

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [model, setModel] = useState<string>(MODELS[0].id);
  const [projectName, setProjectName] = useState('qa-automation-project');
  const [generationLog, setGenerationLog] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('qa_chats');
    const savedId = localStorage.getItem('qa_chats_current_id');
    const savedProject = localStorage.getItem('qa_chats_project');
    const savedModel = localStorage.getItem('qa_chats_model');
    
    if (savedProject) setProjectName(savedProject);
    if (savedModel) setModel(savedModel);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          // Restore exact current ID if it exists in sessions
          if (savedId && parsed.some((s: ChatSession) => s.id === savedId)) {
            setCurrentChatId(savedId);
          } else {
            setCurrentChatId(parsed[0].id);
          }
          return;
        }
      } catch {
        // ignore JSON parse error
      }
    }

    // Default chat
    const id = generateId();
    const newChat: ChatSession = { id, title: 'New Chat', messages: defaultMessages, updatedAt: Date.now() };
    setSessions([newChat]);
    setCurrentChatId(id);
    localStorage.setItem('qa_chats_current_id', id);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('qa_chats', JSON.stringify(sessions));
      if (currentChatId) localStorage.setItem('qa_chats_current_id', currentChatId);
      localStorage.setItem('qa_chats_project', projectName);
      localStorage.setItem('qa_chats_model', model);
    } else {
      localStorage.removeItem('qa_chats');
    }
  }, [sessions, currentChatId, projectName, model]);

  const currentSession = sessions.find(s => s.id === currentChatId);
  const messages = currentSession ? currentSession.messages : defaultMessages;

  const setMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
    setSessions(prev => prev.map(session => {
      if (session.id === currentChatId) {
        const newMessages = typeof updater === 'function' ? updater(session.messages) : updater;
        let title = session.title;
        if (title === 'New Chat') {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...session, messages: newMessages, updatedAt: Date.now(), title };
      }
      return session;
    }));
  }, [currentChatId]);

  const onNewChat = () => {
    const id = generateId();
    const newChat: ChatSession = { id, title: 'New Chat', messages: defaultMessages, updatedAt: Date.now() };
    setSessions(prev => [newChat, ...prev]);
    setCurrentChatId(id);
    setInput('');
  };

  const onSwitchChat = (id: string) => {
    if (isGenerating || isTyping) return;
    setCurrentChatId(id);
    setInput('');
  };

  const onDeleteChat = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const newId = generateId();
        const newChat: ChatSession = { id: newId, title: 'New Chat', messages: defaultMessages, updatedAt: Date.now() };
        setCurrentChatId(newId);
        return [newChat];
      }
      if (currentChatId === id) {
        setCurrentChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleStop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '_[Generation Stopped by User]_',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abortController]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    // Auto-switch model logic
    let targetModel = model;
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('automation') || lowerInput.includes('framework') || lowerInput.includes('scripts')) {
      targetModel = 'codellama';
      setModel('codellama');
    } else if (lowerInput.includes('code') || lowerInput.includes('typescript') || lowerInput.includes('javascript')) {
      if (model !== 'codellama') {
        targetModel = 'deepseek-coder:6.7b';
        setModel('deepseek-coder:6.7b');
      }
    }

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setIsGenerating(true);
    setGenerationLog([]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      let finalPrompt = input;
      const isScaffold = input.trim() === 'Create framework';
      const isUpdate = input.trim() === 'Update framework';

      if (isScaffold) {
        // Step 1: Trigger instant folder scaffolding via backend
        const scaffoldRes = await fetch('/api/scaffold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectName })
        });

        if (!scaffoldRes.ok) {
           const errBody = await scaffoldRes.json().catch(() => ({}));
           throw new Error(errBody.error || "Backend server is down. Please run 'npm run server' first.");
        }

        // Step 2: Decide if we need the LLM
        // If this is the start of a project and user just clicked create, only do structure.
        if (messages.length === 0) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Folder structure created for **${projectName}** at \`D:/projects\`. Add test cases and click **Update** to fill files with logic.`,
            timestamp: new Date().toLocaleTimeString()
          }]);
          setIsGenerating(false);
          setIsTyping(false);
          return;
        }

        finalPrompt = `🚀 SCAFFOLD PROJECT: ${projectName}. GENERATE ALL FILES NOW. DO NOT GIVE INSTRUCTIONS.`;
      } else if (isUpdate) {
        finalPrompt = `🔄 UPDATE PROJECT: ${projectName}. UPDATE ALL FILES BASED ON NEW TEST CASES. DO NOT GIVE INSTRUCTIONS.`;
        const filePath = `${projectName}/tests/test-data/testcases.json`;
        try {
          const resp = await fetch('/api/read-file', {
            method: 'POST',
            body: JSON.stringify({ filePath }),
          });
          const data = await resp.json();
          if (data.success) {
            finalPrompt = `${finalPrompt}\n\nExisting Test Cases (from disk):\n${data.content}\n\nPlease analyze these and update/add missing files.`;
          }
        } catch (e) {
          console.error('Could not read testcases for update:', e);
        }
      }

      const messagesToProcess: ChatMessage[] = [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nIMPORTANT: Use this project name for all file paths: ${projectName}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: finalPrompt },
      ];

      // Clean default message
      let initialBotText = '';
      if (isScaffold) initialBotText = 'Generating framework... ⏳';
      else if (isUpdate) initialBotText = 'Updating framework... ⏳';

      const botMsg: Message = {
        role: 'assistant',
        content: initialBotText,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      let fullContent = '';
      const stream = streamChatMessage(targetModel, messagesToProcess, controller.signal);

      // Throttling for UI responsiveness (Burst-Rendering)
      let lastUpdate = Date.now();
      const UPDATE_INTERVAL = 150; // 150ms larger chunks for 'filling' feel

      for await (const chunk of stream) {
        if (chunk.message?.content) {
          fullContent += chunk.message.content;
          
          const now = Date.now();
          if (!isScaffold && !isUpdate && now - lastUpdate > UPDATE_INTERVAL) {
            lastUpdate = now;
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                const updated = [...prev];
                updated[updated.length - 1] = { ...lastMsg, content: fullContent };
                return updated;
              }
              return prev;
            });
          }
        }
        if (chunk.done) break;
      }

      // Final flush
      if (!isScaffold && !isUpdate) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            const updated = [...prev];
            updated[updated.length - 1] = { ...lastMsg, content: fullContent };
            return updated;
          }
          return prev;
        });
      }

      // Finalize Message
      if (isScaffold || isUpdate) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...lastMsg,
              content: `✅ Structure is ${isScaffold ? 'created' : 'updated'} in projects folder.`
            };
            return updated;
          }
          return prev;
        });
      }

      // Once done, check for code blocks to save to disk
      const logs = await autoSaveToDisk(fullContent, projectName);
      if (logs.length > 0) {
        setGenerationLog(logs);
      }

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error: ' + (err as Error).message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsGenerating(false);
      setAbortController(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isTyping, isGenerating, messages, model, projectName, abortController]);

  return {
    sessions,
    currentChatId,
    onNewChat,
    onSwitchChat,
    onDeleteChat,
    messages,
    input,
    setInput,
    handleSend,
    handleStop,
    isTyping,
    isGenerating,
    model,
    setModel,
    projectName,
    setProjectName,
    generationLog,
    setGenerationLog,
    models: MODELS,
  };
}
