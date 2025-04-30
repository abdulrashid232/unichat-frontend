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

  success(message: string, timeout: number = 5000): void {
    this.showToast(message, 'success', timeout);
  }

  
  error(message: string, timeout: number = 7000): void {
    this.showToast(message, 'error', timeout);
  }

 
  info(message: string, timeout: number = 5000): void {
    this.showToast(message, 'info', timeout);
  }

  warning(message: string, timeout: number = 5000): void {
    this.showToast(message, 'warning', timeout);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  private showToast(message: string, type: ToastType, timeout: number): void {
    const id = this.generateId();
    const toast: Toast = { id, message, type, timeout };

    this.toasts = [...this.toasts, toast];
    this.toastsSubject.next(this.toasts);

    if (timeout > 0) {
      setTimeout(() => this.remove(id), timeout);
    }
  }
  
  private generateId(): string {
    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
