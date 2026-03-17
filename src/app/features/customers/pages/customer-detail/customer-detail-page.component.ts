import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { SubscriptionService } from '../../services/subscription.service';
import { InvoiceService } from '../../services/invoice.service';
import { Customer } from '../../../../shared/models/customer.model';
import { Subscription, SubscriptionListResponse } from '../../../../shared/models/subscription.model';
import { Invoice, InvoiceListResponse } from '../../../../shared/models/invoice.model';
import { InvoicesListComponent } from '../../components/invoices-list/invoices-list.component';
import { SubscriptionsListComponent } from '../../components/subscriptions-list/subscriptions-list.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ApiError } from '../../../../core/services/api.service';
import { ErrorMapperService } from '../../../../core/services/error-mapper.service';
import { ToastService } from '../../../../core/services/toast.service';

const SUBSCRIPTIONS_PAGE_SIZE = 10;
const INVOICES_PAGE_SIZE = 10;

@Component({
  selector: 'customer-detail-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    InvoicesListComponent,
    SubscriptionsListComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.css',
})
export class CustomerDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly datePipe = inject(DatePipe);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly toast = inject(ToastService);

  readonly routeHandle = signal<string>('');
  readonly customer = signal<Customer | null>(null);
  readonly subscriptions = signal<Subscription[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly loading = signal(false);
  readonly loadingMoreSubscriptions = signal(false);
  readonly loadingMoreInvoices = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextSubscriptionsPageToken = signal<string | null>(null);
  readonly nextInvoicesPageToken = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const handle = params.get('handle') ?? '';
        this.routeHandle.set(handle);
        this.loadData(handle);
      });
  }

  onSubscriptionActionError(message: string): void {
    this.error.set(message);
  }

  refreshSubscriptions(): void {
    const handle = this.customer()?.handle;
    if (!handle) return;
    this.subscriptionService
      .getSubscriptionsForCustomer(handle, SUBSCRIPTIONS_PAGE_SIZE)
      .subscribe({
        next: (res) => {
          this.subscriptions.set(res.content);
          this.nextSubscriptionsPageToken.set(res.next_page_token ?? null);
        },
        error: (err: ApiError) =>
          this.error.set(
            this.errorMapper.toMessage(err, 'subscriptions.refresh')
          ),
      });
  }

  loadMoreSubscriptions(): void {
    const customerHandle = this.customer()?.handle;
    const token = this.nextSubscriptionsPageToken();
    if (!customerHandle || !token) return;
    if (this.loading() || this.loadingMoreSubscriptions()) return;
    if (this.error()) return;

    this.loadingMoreSubscriptions.set(true);
    this.subscriptionService
      .getSubscriptionsForCustomer(customerHandle, SUBSCRIPTIONS_PAGE_SIZE, token)
      .subscribe({
        next: (res: SubscriptionListResponse) => {
          const existing = this.subscriptions();
          const existingHandles = new Set(existing.map((s) => s.handle));
          const newItems = res.content.filter((s) => !existingHandles.has(s.handle));
          this.subscriptions.set([...existing, ...newItems]);

          const nextToken = res.next_page_token ?? null;
          this.nextSubscriptionsPageToken.set(
            newItems.length === 0 || nextToken === token ? null : nextToken,
          );
          this.loadingMoreSubscriptions.set(false);
        },
        error: (err: ApiError) => {
          const message = this.errorMapper.toMessage(err, 'subscriptions.more');
          this.toast.error(message);
          this.error.set(message);
          this.loadingMoreSubscriptions.set(false);
        },
      });
  }

  loadMoreInvoices(): void {
    const customerHandle = this.customer()?.handle;
    const token = this.nextInvoicesPageToken();
    if (!customerHandle || !token) return;
    if (this.loading() || this.loadingMoreInvoices()) return;
    if (this.error()) return;

    this.loadingMoreInvoices.set(true);
    this.invoiceService
      .getInvoicesForCustomer(customerHandle, INVOICES_PAGE_SIZE, token)
      .subscribe({
        next: (res: InvoiceListResponse) => {
          const existing = this.invoices();
          const existingIds = new Set(existing.map((i) => i.id));
          const newItems = res.content.filter((i) => !existingIds.has(i.id));
          this.invoices.set([...existing, ...newItems]);

          const nextToken = res.next_page_token ?? null;
          this.nextInvoicesPageToken.set(
            newItems.length === 0 || nextToken === token ? null : nextToken,
          );
          this.loadingMoreInvoices.set(false);
        },
        error: (err: ApiError) => {
          const message = this.errorMapper.toMessage(err, 'invoices.more');
          this.toast.error(message);
          this.error.set(message);
          this.loadingMoreInvoices.set(false);
        },
      });
  }

  private loadData(handle: string): void {
    if (!handle) {
      this.customer.set(null);
      this.subscriptions.set([]);
      this.invoices.set([]);
      this.loading.set(false);
      this.error.set(null);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      customer: this.customerService.getCustomer(handle),
      invoices: this.invoiceService.getInvoicesForCustomer(handle, INVOICES_PAGE_SIZE),
      subscriptions: this.subscriptionService.getSubscriptionsForCustomer(
        handle,
        SUBSCRIPTIONS_PAGE_SIZE
      ),
    }).subscribe({
      next: ({ customer, invoices, subscriptions }) => {
        this.customer.set(customer);
        this.invoices.set(invoices.content);
        this.subscriptions.set(subscriptions.content);
        this.nextInvoicesPageToken.set(invoices.next_page_token ?? null);
        this.nextSubscriptionsPageToken.set(subscriptions.next_page_token ?? null);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(this.errorMapper.toMessage(err, 'customer.detail.load'));
        this.customer.set(null);
        this.subscriptions.set([]);
        this.invoices.set([]);
        this.nextInvoicesPageToken.set(null);
        this.nextSubscriptionsPageToken.set(null);
        this.loading.set(false);
      },
    });
  }
}
