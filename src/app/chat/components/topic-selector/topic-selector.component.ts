import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Topic } from '../../../models/topic.model';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-topic-selector',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './topic-selector.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TopicSelectorComponent {
  @Input() topics: Topic[] = [];
  @Input() selectedTopic: Topic | null = null;
  @Output() topicSelected = new EventEmitter<Topic | null>();

  isOpen = false;

  selectTopic(topic: Topic) {
    this.selectedTopic = topic;
    this.topicSelected.emit(topic);
    this.isOpen = false;
  }

  clearSelection() {
    this.selectedTopic = null;
    this.topicSelected.emit(null);
    this.isOpen = false;
  }
}
