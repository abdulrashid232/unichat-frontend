import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Topic } from '../../../models/topic.model';
import { TopicSelectorComponent } from '../topic-selector/topic-selector.component';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TopicSelectorComponent],
  templateUrl: './message-input.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MessageInputComponent {
  @Input() formGroup!: FormGroup;
  @Input() isLoading = false;
  @Input() topics: Topic[] = [];
  @Input() selectedTopic: Topic | null = null;
  @Output() sendMessage = new EventEmitter<void>();
  @Output() topicSelected = new EventEmitter<Topic | null>();

  onSubmit() {
    if (this.formGroup.invalid || this.isLoading) {
      return;
    }
    
    this.sendMessage.emit();
  }

  onTopicSelected(topic: Topic | null) {
    this.topicSelected.emit(topic);
  }
}
