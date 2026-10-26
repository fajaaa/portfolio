import { Injectable, signal } from '@angular/core';

export interface Toast {
  readonly id: number;
  readonly title: string;
  readonly detail?: string;
  readonly key?: string;
}

export interface ToastOptions {
  /** Already translated text. */
  title: string;
  detail?: string;
  /** A new toast replaces any visible toast with the same key. */
  key?: string;
  /** How long it stays, in ms. */
  duration?: number;
}

const MAX_VISIBLE = 3;

/** Short, non-blocking notifications rendered by `<app-toast-outlet>`. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<readonly Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 1;

  readonly toasts = this.items.asReadonly();

  show({ title, detail, key, duration = 2400 }: ToastOptions): number {
    const stale = this.items().filter((toast) => key !== undefined && toast.key === key);
    stale.forEach((toast) => this.dismiss(toast.id));

    const toast: Toast = { id: this.nextId++, title, detail, key };
    this.items.update((items) => [...items, toast]);
    this.timers.set(
      toast.id,
      setTimeout(() => this.dismiss(toast.id), duration),
    );

    const overflow = this.items().slice(0, -MAX_VISIBLE);
    overflow.forEach((old) => this.dismiss(old.id));

    return toast.id;
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.items.update((items) => items.filter((toast) => toast.id !== id));
  }
}
