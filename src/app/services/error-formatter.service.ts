import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorFormatterService {
  constructor() {}

  formatError(
    error: any,
    defaultMessage = 'An unexpected error occurred'
  ): string {
    if (!error) return defaultMessage;

    if (error.status) {
      switch (error.status) {
        case 400:
          return this.getBadRequestMessage(error);
        case 401:
          return 'You are not authorized. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with the current state.';
        case 422:
          return this.getValidationMessage(error);
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service unavailable. Please try again later.';
        default:
          return defaultMessage
      }
    }

    let message = defaultMessage;

    if (typeof error === 'string') {
      message = error;
    } else if (error.message) {
      message = error.message;
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.statusText && error.status) {
      message = `${error.statusText} (${error.status})`;
    }
    return this.cleanMessage(message);
  }

  private getValidationMessage(error: any): string {
    if (Array.isArray(error.error?.errors)) {
      return error.error.errors.map((e: any) => e.message ?? e).join('. ');
    }

    if (typeof error.error?.errors === 'object') {
      const messages: string[] = [];
      for (const key in error.error.errors) {
        if (Object.prototype.hasOwnProperty.call(error.error.errors, key)) {
          const value = error.error.errors[key];
          messages.push(Array.isArray(value) ? value.join('. ') : value);
        }
      }
      return messages.join('. ');
    }

    return 'Validation failed. Please check your input.';
  }

  private getBadRequestMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }

    return 'Invalid request. Please check your input.';
  }

  private cleanMessage(message: string): string {
    return message
      .replace(/^error:?\s*/i, '') 
      .replace(/^exception:?\s*/i, '') 
      .replace(/^failed:?\s*/i, '') 
      .replace(/\.$/, '') 
      .replace(/^[a-z]/, (c) => c.toUpperCase())
      .trim();
  }
}
