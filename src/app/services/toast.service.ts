import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);

  toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  constructor() {}

  /**
   * Show a success toast notification
   */
  success(message: string, timeout: number = 5000): void {
    this.showToast(message, 'success', timeout);
  }

  /**
   * Show an error toast notification
   */
  error(message: string, timeout: number = 7000): void {
    this.showToast(message, 'error', timeout);
  }

  /**
   * Show an info toast notification
   */
  info(message: string, timeout: number = 5000): void {
    this.showToast(message, 'info', timeout);
  }

  /**
   * Show a warning toast notification
   */
  warning(message: string, timeout: number = 5000): void {
    this.showToast(message, 'warning', timeout);
  }

  /**
   * Remove a toast by its id
   */
  remove(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  /**
   * Create and display a new toast notification
   */
  private showToast(message: string, type: ToastType, timeout: number): void {
    const id = this.generateId();
    const toast: Toast = { id, message, type, timeout };

    this.toasts = [...this.toasts, toast];
    this.toastsSubject.next(this.toasts);

    if (timeout > 0) {
      setTimeout(() => this.remove(id), timeout);
    }
  }

  /**
   * Generate a unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
