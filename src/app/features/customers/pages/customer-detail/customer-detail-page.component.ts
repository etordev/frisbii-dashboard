import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { SubscriptionService } from '../../services/subscription.service';
import { InvoiceService } from '../../services/invoice.service';
import { Customer } from '../../../../shared/models/customer.model';
import { Subscription } from '../../../../shared/models/subscription.model';
import { Invoice } from '../../../../shared/models/invoice.model';
import { InvoicesListComponent } from '../../components/invoices-list/invoices-list.component';
import { SubscriptionsListComponent } from '../../components/subscriptions-list/subscriptions-list.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ApiError } from '../../../../core/services/api.service';

const PAGE_SIZE = 50;

@Component({
  selector: 'customer-detail-page',
  standalone: true,
  imports: [
    DatePipe,
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

  readonly customer = signal<Customer | null>(null);
  readonly subscriptions = signal<Subscription[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const handle = params.get('handle') ?? '';
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
      .getSubscriptionsForCustomer(handle, PAGE_SIZE)
      .subscribe({
        next: (res) => this.subscriptions.set(res.content),
        error: (err: ApiError) =>
          this.error.set(err.message ?? 'Failed to refresh subscriptions'),
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
      invoices: this.invoiceService.getInvoicesForCustomer(handle, PAGE_SIZE),
      subscriptions: this.subscriptionService.getSubscriptionsForCustomer(
        handle,
        PAGE_SIZE
      ),
    }).subscribe({
      next: ({ customer, invoices, subscriptions }) => {
        this.customer.set(customer);
        this.invoices.set(invoices.content);
        this.subscriptions.set(subscriptions.content);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message ?? 'Failed to load customer data');
        this.customer.set(null);
        this.subscriptions.set([]);
        this.invoices.set([]);
        this.loading.set(false);
      },
    });
  }
}
