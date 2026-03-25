
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  category?: string;
  timestamp: string;
}

export interface ModelOption {
  id: string;
  name: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}
