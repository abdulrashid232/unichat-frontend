import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { ChatSession } from '../models/message.model';
import { Topic, PREDEFINED_TOPICS } from '../models/topic.model';
import { CommonModule } from '@angular/common';
import { ChatBubbleComponent } from './components/chat-bubble/chat-bubble.component';
import { MessageInputComponent } from './components/message-input/message-input.component';
import { TopicSelectorComponent } from './components/topic-selector/topic-selector.component';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChatBubbleComponent,
    MessageInputComponent,
    TopicSelectorComponent,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') private readonly chatContainer!: ElementRef;

  messageForm: FormGroup;
  currentSession: ChatSession | null = null;
  availableSessions: ChatSession[] = [];
  topics: Topic[] = PREDEFINED_TOPICS;
  selectedTopic: Topic | null = null;
  isLoading = false;
  scrollToBottom = false;
  isSessionMenuOpen = false; // Add this property

  private readonly destroy$ = new Subject<void>();
  private readonly currentSessionSubject = new Subject<ChatSession | null>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly chatService: ChatService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    // Load chat history to get available sessions
    this.chatService.loadChatHistory().subscribe((data) => {
      this.availableSessions = data.sessions || [];

      this.route.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe((queryParams) => {
          if (queryParams['session'] && this.availableSessions.length) {
            this.loadSession(queryParams['session']);
          } else {
            this.currentSession = null;
          }
        });
    });

    // Subscribe to the current session changes
    this.chatService.currentSession$
      .pipe(takeUntil(this.destroy$))
      .subscribe((session) => {
        if (session) {
          this.currentSession = session;
          this.scrollToBottom = true;
        }
      });

    // Subscribe to loading state
    this.chatService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.isLoading = loading;
      });

    // Subscribe to sessions list
    this.chatService.sessions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessions) => {
        this.availableSessions = sessions;
      });
  }

  ngAfterViewChecked() {
    if (this.scrollToBottom) {
      this.scrollChatToBottom();
      this.scrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSession(sessionId: string) {
    if (!sessionId) {
      console.error('Cannot load session: No session ID provided');
      return;
    }

    this.router.navigate(['/chat'], {
      queryParams: { session: sessionId },
      replaceUrl: true,
      skipLocationChange: false,
    });

    // Fetch session with messages
    this.chatService.getSessionById(sessionId).subscribe({
      next: () => {
        this.scrollToBottom = true;
      },
      error: (err) => {
        console.error('Failed to load session:', err);
      },
    });
  }

  createNewSession() {
    this.currentSession = null;
    this.currentSessionSubject?.next(null);

    this.messageForm.get('message')?.setValue('');

    this.router.navigate(['/chat'], {
      replaceUrl: true,
      queryParams: {},
    });
  }

  onSendMessage() {
    if (this.messageForm.invalid || this.isLoading) {
      return;
    }

    const message = this.messageForm.get('message')?.value;

    if (!message) {
      return;
    }

    const topic = this.selectedTopic?.name;

    // Clear the input immediately for better UX
    this.messageForm.get('message')?.setValue('');

    // Set loading state
    this.isLoading = true;

    if (!this.currentSession) {
      // No active session, send a new message which will create a session
      this.chatService.sendNewMessage(message, topic).subscribe({
        next: (response) => {
          // If a session was created, navigate to it using query params
          if (response?.data?.session?.id) {
            this.router.navigate(['/chat'], {
              queryParams: { session: response.data.session.id },
              replaceUrl: true,
            });
          }
          this.scrollToBottom = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.isLoading = false;
        },
      });
    } else {
      // Send to existing session
      this.chatService
        .sendMessageToSession(
          this.currentSession.id,
          message,
          topic ?? this.currentSession.topic
        )
        .subscribe({
          error: (err) => {
            console.error('Error sending message to session:', err);
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    }

    // Scroll to bottom to see the new message
    this.scrollToBottom = true;
  }

  onTopicSelected(topic: Topic | null) {
    this.selectedTopic = topic;
  }

  onSessionSelected(sessionId: string) {
    this.loadSession(sessionId);
  }

  private scrollChatToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom', err);
    }
  }
}
