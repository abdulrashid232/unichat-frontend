import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  @Output() sendMessage = new EventEmitter<void>();

  onSubmit() {
    if (this.formGroup.invalid || this.isLoading) {
      return;
    }
    
    this.sendMessage.emit();
  }
}
