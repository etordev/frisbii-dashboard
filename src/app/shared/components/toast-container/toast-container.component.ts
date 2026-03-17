import { Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'toast-container',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  readonly toasts = this.toastService.toasts;
  readonly ariaLive = computed(() =>
    this.toasts().some((t) => t.type === 'error') ? 'assertive' : 'polite',
  );

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}

