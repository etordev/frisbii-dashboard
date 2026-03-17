import { describe, expect, it, vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('adds a toast and auto-dismisses it', () => {
    vi.useFakeTimers();
    const svc = new ToastService();

    svc.success('Saved!', 1000);
    expect(svc.toasts().length).toBe(1);
    expect(svc.toasts()[0].message).toBe('Saved!');
    expect(svc.toasts()[0].type).toBe('success');

    vi.advanceTimersByTime(1000);
    // after duration, it should be leaving (then removed after animation)
    expect(svc.toasts()[0]?.leaving).toBe(true);

    vi.advanceTimersByTime(300);
    expect(svc.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('dismiss marks toast as leaving', () => {
    vi.useFakeTimers();
    const svc = new ToastService();
    svc.info('Hello', 5000);
    const id = svc.toasts()[0].id;

    svc.dismiss(id);
    expect(svc.toasts()[0].leaving).toBe(true);

    vi.advanceTimersByTime(300);
    expect(svc.toasts().length).toBe(0);
    vi.useRealTimers();
  });
});

