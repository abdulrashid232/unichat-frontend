import { Component, Input } from '@angular/core';
import { Message } from '../../../models/message.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule],
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
