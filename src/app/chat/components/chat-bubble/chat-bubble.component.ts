import { Component, Input } from '@angular/core';
import { Message } from '../../../models/message.model';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './chat-bubble.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ChatBubbleComponent {
  @Input() message!: Message;
}
