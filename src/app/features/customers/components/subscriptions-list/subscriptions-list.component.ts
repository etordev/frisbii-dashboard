import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from '../../../../shared/models/subscription.model';
import { TableConfig } from '../../../../shared/models/table-config.model';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { SubscriptionService } from '../../services/subscription.service';

const KNOWN_STATES = ['active', 'cancelled', 'expired', 'on_hold'] as const;
export type SubscriptionStateDisplay =
  | (typeof KNOWN_STATES)[number]
  | 'unknown';

@Component({
  selector: 'subscriptions-list',
  standalone: true,
  imports: [DatePipe, DataTableComponent],
  templateUrl: './subscriptions-list.component.html',
  styleUrl: './subscriptions-list.component.css',
})
export class SubscriptionsListComponent {
  subscriptions = input.required<Subscription[]>();
  refreshRequested = output<void>();

  private readonly subscriptionService = inject(SubscriptionService);
  private readonly datePipe = inject(DatePipe);

  readonly subscriptionTableConfig: TableConfig<Subscription> = {
    columns: [
      {
        key: 'state',
        header: 'State',
        formatter: (row) => row.state || 'unknown',
        cellClass: (row) =>
          'state-badge state-' + this.stateDisplay(row.state),
      },
      { key: 'handle', header: 'Handle' },
      { key: 'plan', header: 'Plan' },
      {
        key: 'created',
        header: 'Created',
        formatter: (row) =>
          this.datePipe.transform(row.created, 'mediumDate') ?? '',
      },
    ],
    actions: [
      {
        id: 'pause',
        label: 'Pause',
        visible: (row) => row.state === 'active',
      },
      {
        id: 'reactivate',
        label: 'Unpause',
        visible: (row) => row.state === 'on_hold',
      },
    ],
  };

  stateDisplay(state: string): SubscriptionStateDisplay {
    const normalized = state?.toLowerCase() ?? '';
    return KNOWN_STATES.includes(
      normalized as (typeof KNOWN_STATES)[number]
    )
      ? (normalized as SubscriptionStateDisplay)
      : 'unknown';
  }

  onActionClick(event: { actionId: string; row: Subscription }): void {
    const { actionId, row } = event;
    if (actionId === 'pause') {
      this.subscriptionService.pauseSubscription(row.handle).subscribe({
        next: () => this.refreshRequested.emit(),
        error: () => {}
      });
    } else if (actionId === 'reactivate') {
      this.subscriptionService.reactivateSubscription(row.handle).subscribe({
        next: () => this.refreshRequested.emit(),
        error: () => {}
      });
    }
  }
}
