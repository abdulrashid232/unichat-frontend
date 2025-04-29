import { Injectable } from '@angular/core';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { ChatSession } from '../models/message.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get chat history - delegates to ChatService
   */
  getChatHistory(): Observable<ChatSession[]> {
    return this.chatService
      .loadChatHistory()
      .pipe(map((data) => data.sessions || []));
  }

  /**
   * Delete chat session - delegates to ChatService
   */
  deleteChatSession(sessionId: string): Observable<any> {
    return this.chatService.deleteSession(sessionId);
  }

  /**
   * Get specific session details - delegates to ChatService
   */
  getSession(sessionId: string): Observable<ChatSession> {
    return this.chatService.getSessionById(sessionId);
  }
}
