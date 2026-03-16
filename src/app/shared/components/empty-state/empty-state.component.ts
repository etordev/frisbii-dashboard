import { Component, input } from '@angular/core';

export type EmptyStateType = 'empty' | 'error';

@Component({
  selector: 'empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  message = input.required<string>();
  type = input<EmptyStateType>('empty');
}
