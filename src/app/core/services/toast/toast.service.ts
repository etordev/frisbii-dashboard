import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  durationMs: number;
  leaving: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly animationMs = 220;
  private readonly maxToasts = 4;

  success(message: string, durationMs = 3000): void {
    this.show({ type: 'success', message, durationMs });
  }

  error(message: string, durationMs = 4500): void {
    this.show({ type: 'error', message, durationMs });
  }

  info(message: string, durationMs = 3000): void {
    this.show({ type: 'info', message, durationMs });
  }

  warning(message: string, durationMs = 3500): void {
    this.show({ type: 'warning', message, durationMs });
  }

  dismiss(id: string): void {
    const existing = this._toasts();
    const toast = existing.find((t) => t.id === id);
    if (!toast || toast.leaving) return;

    this._toasts.set(
      existing.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );

    window.setTimeout(() => {
      this._toasts.set(this._toasts().filter((t) => t.id !== id));
    }, this.animationMs);
  }

  private show(input: { type: ToastType; message: string; durationMs: number }): void {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const toast: Toast = {
      id,
      type: input.type,
      message: input.message,
      durationMs: input.durationMs,
      leaving: false,
    };

    const next = [toast, ...this._toasts()].slice(0, this.maxToasts);
    this._toasts.set(next);

    window.setTimeout(() => this.dismiss(id), input.durationMs);
  }
}

