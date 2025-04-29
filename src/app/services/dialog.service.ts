import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogConfig {
  title?: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialogVisibleSubject = new BehaviorSubject<boolean>(false);
  private readonly dialogConfigSubject = new BehaviorSubject<DialogConfig>({});

  dialogVisible$: Observable<boolean> =
    this.dialogVisibleSubject.asObservable();
  dialogConfig$: Observable<DialogConfig> =
    this.dialogConfigSubject.asObservable();

  private resolveConfirmation?: (value: boolean) => void;

  constructor() {}

  open(config: DialogConfig = {}): Promise<boolean> {
    this.dialogConfigSubject.next({
      title: config.title ?? 'Confirm Action',
      message: config.message ?? 'Are you sure you want to proceed?',
      confirmButtonText: config.confirmButtonText ?? 'Confirm',
      cancelButtonText: config.cancelButtonText ?? 'Cancel',
    });

    this.dialogVisibleSubject.next(true);

    return new Promise<boolean>((resolve) => {
      this.resolveConfirmation = resolve;
    });
  }

  confirm(): void {
    this.dialogVisibleSubject.next(false);
    if (this.resolveConfirmation) {
      this.resolveConfirmation(true);
      this.resolveConfirmation = undefined;
    }
  }

  cancel(): void {
    this.dialogVisibleSubject.next(false);
    if (this.resolveConfirmation) {
      this.resolveConfirmation(false);
      this.resolveConfirmation = undefined;
    }
  }
}
