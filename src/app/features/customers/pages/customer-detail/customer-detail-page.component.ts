import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { InvoiceService } from '../../services/invoice.service';
import { Subscription } from '../../../../shared/models/subscription.model';
import { Invoice } from '../../../../shared/models/invoice.model';
import { TableConfig } from '../../../../shared/models/table-config.model';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ApiError } from '../../../../core/services/api.service';

const PAGE_SIZE = 50;

@Component({
  selector: 'app-customer-detail-page',
  standalone: true,
  imports: [
    DatePipe,
    DataTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.css',
})
export class CustomerDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly datePipe = inject(DatePipe);

  readonly customerHandle = signal<string>('');
  readonly subscriptions = signal<Subscription[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly subscriptionsLoading = signal(false);
  readonly invoicesLoading = signal(false);
  readonly subscriptionsError = signal<string | null>(null);
  readonly invoicesError = signal<string | null>(null);

  readonly subscriptionTableConfig: TableConfig<Subscription> = {
    columns: [
      { key: 'handle', header: 'Handle' },
      { key: 'state', header: 'State' },
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
        label: 'Reactivate',
        visible: (row) => row.state === 'on_hold',
      },
    ],
  };

  readonly invoiceTableConfig: TableConfig<Invoice> = {
    columns: [
      { key: 'handle', header: 'Handle' },
      { key: 'state', header: 'State' },
      {
        key: 'amount',
        header: 'Amount',
        formatter: (row) =>
          `${row.amount} ${row.currency}`,
      },
      {
        key: 'created',
        header: 'Created',
        formatter: (row) =>
          this.datePipe.transform(row.created, 'mediumDate') ?? '',
      },
    ],
  };

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const handle = params.get('handle') ?? '';
        this.customerHandle.set(handle);
        this.loadSubscriptions(handle);
        this.loadInvoices(handle);
      });
  }

  onSubscriptionAction(event: { actionId: string; row: Subscription }): void {
    const { actionId, row } = event;
    if (actionId === 'pause') {
      this.subscriptionService.pauseSubscription(row.handle).subscribe({
        next: () => this.loadSubscriptions(this.customerHandle()),
        error: () => {
          this.subscriptionsError.set('Failed to pause subscription');
        },
      });
    } else if (actionId === 'reactivate') {
      this.subscriptionService.reactivateSubscription(row.handle).subscribe({
        next: () => this.loadSubscriptions(this.customerHandle()),
        error: () => {
          this.subscriptionsError.set('Failed to reactivate subscription');
        },
      });
    }
  }

  private loadSubscriptions(handle: string): void {
    if (!handle) return;
    this.subscriptionsLoading.set(true);
    this.subscriptionsError.set(null);
    this.subscriptionService
      .getSubscriptionsForCustomer(handle, PAGE_SIZE)
      .subscribe({
        next: (res) => {
          this.subscriptions.set(res.content);
          this.subscriptionsLoading.set(false);
        },
        error: (err: ApiError) => {
          this.subscriptionsError.set(
            err.message ?? 'Failed to load subscriptions'
          );
          this.subscriptions.set([]);
          this.subscriptionsLoading.set(false);
        },
      });
  }

  private loadInvoices(handle: string): void {
    if (!handle) return;
    this.invoicesLoading.set(true);
    this.invoicesError.set(null);
    this.invoiceService.getInvoicesForCustomer(handle, PAGE_SIZE).subscribe({
      next: (res) => {
        this.invoices.set(res.content);
        this.invoicesLoading.set(false);
      },
      error: (err: ApiError) => {
        this.invoicesError.set(err.message ?? 'Failed to load invoices');
        this.invoices.set([]);
        this.invoicesLoading.set(false);
      },
    });
  }
}
