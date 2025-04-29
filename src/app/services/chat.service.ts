import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, switchMap, finalize } from 'rxjs/operators';
import { ChatSession, Message } from '../models/message.model';
import { Environment } from 'environment/environment';

interface ChatResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly API_URL = Environment.BackendUrl + '/api/chat';
  private readonly SESSIONS_URL = Environment.BackendUrl + '/api/sessions';

  private readonly currentSessionSubject =
    new BehaviorSubject<ChatSession | null>(null);
  currentSession$ = this.currentSessionSubject.asObservable();

  private readonly sessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  sessions$ = this.sessionsSubject.asObservable();

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    // Load history at startup
    this.loadChatHistory().subscribe();
  }

  // Send a new message (creates a new chat session if needed)
  sendNewMessage(message: string, topic?: string): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .post<ChatResponse>(`${this.API_URL}/message`, {
        message,
        topic,
      })
      .pipe(
        tap((response) => {
          const { session } = response.data;

          // If this is a new session, add the message to our current session
          if (session?.id) {
            // Get the full session with messages
            this.getSessionById(session.id).subscribe();
          }
        }),
        finalize(() => this.loadingSubject.next(false)),
        catchError(this.handleErrorWithLoading())
      );
  }

  // Send a message to an existing conversation
  sendMessageToSession(
    sessionId: string,
    message: string,
    topic?: string
  ): Observable<any> {
    if (!sessionId) {
      return throwError(() => new Error('Session ID is required'));
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Optimistically update the UI with user message while waiting for AI response
    const currentSession = this.currentSessionSubject.value;

    if (currentSession && currentSession.id === sessionId) {
      // Create a temporary user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date(),
        conversationId: sessionId,
        topic: topic ?? currentSession.topic,
      };

      // Add to current messages
      const updatedMessages = [
        ...(currentSession.messages || []),
        tempUserMessage,
      ];

      // Update the session
      this.currentSessionSubject.next({
        ...currentSession,
        messages: updatedMessages,
      });
    }

    return this.http
      .post<ChatResponse>(`${this.API_URL}/sessions/${sessionId}/message`, {
        message,
        topic,
      })
      .pipe(
        switchMap((response) => {
          // After successful message send, update the session with latest messages
          return this.getSessionById(sessionId);
        }),
        catchError((error) => {
          // Revert the optimistic update if there was an error
          if (currentSession) {
            this.currentSessionSubject.next(currentSession);
          }
          return this.handleErrorWithLoading()(error);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  // Load all available chat sessions
  loadChatHistory(): Observable<{ sessions: ChatSession[] }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<ChatResponse>(`${this.API_URL}/history`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error ?? 'Failed to load chat history');
        }
        return response.data as { sessions: ChatSession[] };
      }),
      tap((data) => {
        // Format timestamps for all sessions
        const sessions = (data.sessions || []).map((session) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          lastMessageAt: new Date(session.lastMessageAt),
          messages: (session.messages || []).map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));

        this.sessionsSubject.next(sessions);
      }),
      finalize(() => this.loadingSubject.next(false)),
      catchError(this.handleErrorWithLoading())
    );
  }

  // Get a specific session by ID with all messages
  getSessionById(sessionId: string): Observable<ChatSession> {
    if (!sessionId) {
      return throwError(() => new Error('Session ID is required'));
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .get<ChatResponse>(`${this.API_URL}/sessions/${sessionId}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error ?? 'Failed to load session');
          }

          // Extract session from response
          const session = response.data;

          // Ensure proper date objects and format messages
          const formattedSession = {
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            lastMessageAt: new Date(session.lastMessageAt),
            messages: (session.messages ?? []).map((msg: Message) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          };

          return formattedSession;
        }),
        tap((formattedSession) => {
          // Update current session
          this.currentSessionSubject.next(formattedSession);

          // Also update this session in the sessions list
          const currentSessions = this.sessionsSubject.value;
          const updatedSessions = currentSessions.map((s) =>
            s.id === formattedSession.id
              ? {
                  ...s,
                  title: formattedSession.title,
                  lastMessageAt: formattedSession.lastMessageAt,
                }
              : s
          );
          this.sessionsSubject.next(updatedSessions);
        }),
        finalize(() => this.loadingSubject.next(false)),
        catchError(this.handleErrorWithLoading())
      );
  }

  // Delete a session and all its messages
  deleteSession(sessionId: string): Observable<any> {
    if (!sessionId) {
      return throwError(() => new Error('Session ID is required'));
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .delete<ChatResponse>(`${this.SESSIONS_URL}/${sessionId}`)
      .pipe(
        tap(() => {
          // Remove from sessions list
          const currentSessions = this.sessionsSubject.value;
          const updatedSessions = currentSessions.filter(
            (session) => session.id !== sessionId
          );
          this.sessionsSubject.next(updatedSessions);

          // If this was the current session, clear it
          if (this.currentSessionSubject.value?.id === sessionId) {
            this.currentSessionSubject.next(null);
          }
        }),
        finalize(() => this.loadingSubject.next(false)),
        catchError(this.handleErrorWithLoading())
      );
  }

  // Clear all chat history
  clearChatHistory(): Observable<any> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<ChatResponse>(`${this.API_URL}/history`).pipe(
      tap(() => {
        this.sessionsSubject.next([]);
        this.currentSessionSubject.next(null);
      }),
      finalize(() => this.loadingSubject.next(false)),
      catchError(this.handleErrorWithLoading())
    );
  }

  // Helper methods for error handling
  private handleErrorWithLoading(): (error: any) => Observable<never> {
    return (error: any) => {
      this.loadingSubject.next(false);
      return this.handleError(error);
    };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.errorSubject.next(errorMessage);
    console.error('Chat service error:', errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}
