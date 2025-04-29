export interface Message {
  id?: string;
  text: string; 
  sender: "user" | "ai";
  timestamp: Date;
  topic?: string;
  isError?: boolean;
  conversationId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  topic?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  isActive?: boolean;
}
