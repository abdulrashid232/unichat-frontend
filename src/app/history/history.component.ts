import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService } from '../services/history.service';
import { ChatSession } from '../models/message.model';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  chatSessions: ChatSession[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  showDeleteConfirmation = false;
  sessionToDelete: string | null = null;

  constructor(
    private readonly historyService: HistoryService,
    private readonly router: Router,
    public readonly dialogService: DialogService
  ) {}

  ngOnInit() {
    this.loadChatHistory();
  }

  loadChatHistory() {
    this.isLoading = true;
    this.errorMessage = null;

    this.historyService.getChatHistory().subscribe({
      next: (sessions) => {
        this.chatSessions = sessions || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to load chat history: ${error.message}`;
        this.isLoading = false;
      },
    });
  }

  viewChatSession(sessionId: string) {
    this.router.navigate(['/chat'], { queryParams: { session: sessionId } });
  }

  async deleteChatSession(sessionId: string, event: Event) {
    event.stopPropagation();

    const confirmed = await this.dialogService.open({
      title: 'Delete Chat Session',
      message:
        'Are you sure you want to delete this chat session? This action cannot be undone.',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed) {
      this.historyService.deleteChatSession(sessionId).subscribe({
        next: () => {
          this.chatSessions = this.chatSessions.filter(
            (session) => session.id !== sessionId
          );
        },
        error: (error) => {
          this.errorMessage = `Failed to delete chat session: ${error.message}`;
        },
      });
    }
  }

  getChatTitle(session: ChatSession): string {
    if (session.title) {
      return session.title;
    }

    if (session.messages && session.messages.length > 0) {
      const firstUserMessage = session.messages.find(
        (m) => m.sender === 'user'
      );
      if (firstUserMessage) {
        return (
          firstUserMessage.text.substring(0, 50) +
          (firstUserMessage.text.length > 50 ? '...' : '')
        );
      }
    }

    return 'Untitled Chat';
  }

  getLastMessagePreview(session: ChatSession): string {
    if (!session.messages || session.messages.length === 0) {
      return 'No messages';
    }

    const lastMessage = session.messages[session.messages.length - 1];
    return `${
      lastMessage.sender === 'user' ? 'You' : 'AI'
    }: ${lastMessage.text.substring(0, 60)}${
      lastMessage.text.length > 60 ? '...' : ''
    }`;
  }
}
