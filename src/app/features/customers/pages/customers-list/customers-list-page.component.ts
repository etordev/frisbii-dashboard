import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { CustomerService } from '../../services/customer/customer.service';
import { Customer } from '../../../../shared/models/customer.model';
import { TableConfig } from '../../../../shared/models/table-config.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { ApiError } from '../../../../core/services/api/api.service';
import { ErrorMapperService } from '../../../../core/services/error-mapper/error-mapper.service';

const PAGE_SIZE = 30;

@Component({
  selector: 'customers-list-page',
  standalone: true,
  imports: [
    DatePipe,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    DataTableComponent,
  ],
  templateUrl: './customers-list-page.component.html',
  styleUrl: './customers-list-page.component.css',
})
export class CustomersListPageComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly datePipe = inject(DatePipe);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly searchChanges$ = new Subject<string>();

  readonly customerTableConfig: TableConfig<Customer> = {
    columns: [
      { key: 'handle', header: 'Handle' },
      {
        key: 'name',
        header: 'Name',
        formatter: (row) => `${row.first_name} ${row.last_name}`.trim(),
      },
      { key: 'email', header: 'Email' },
      { key: 'company', header: 'Company' },
      {
        key: 'created',
        header: 'Created',
        formatter: (row) =>
          this.datePipe.transform(row.created, 'mediumDate') ?? '',
      },
    ],
  };

  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly nextPageToken = signal<string | null>(null);

  ngOnInit(): void {
    this.checkRoute();
    this.listenForSearchTermChanges();
  }

  checkRoute(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const handle = params['handle'] ?? '';
        this.searchTerm.set(handle);
        this.loadList(handle || undefined);
      });
  }

  listenForSearchTermChanges() {
    this.searchChanges$
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { handle: term || null },
          queryParamsHandling: 'merge',
        });
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const normalized = value ?? '';
    this.searchTerm.set(normalized);
    this.searchChanges$.next(normalized);
  }

  goToCustomer(handle: string): void {
    this.router.navigate(['/customer', handle]);
  }

  private loadList(handle?: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.nextPageToken.set(null);
    this.customerService.getCustomers(PAGE_SIZE, handle).subscribe({
      next: (res) => {
        this.customers.set(res.content);
        this.nextPageToken.set(res.next_page_token ?? null);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(this.errorMapper.toMessage(err, 'customers.list'));
        this.customers.set([]);
        this.nextPageToken.set(null);
        this.loading.set(false);
      },
    });
  }

  onBottomReached(): void {
    this.loadMore();
  }

  private loadMore(): void {
    const token = this.nextPageToken();
    if (!token) return;
    if (this.loading() || this.loadingMore()) return;
    if (this.error()) return;

    this.loadingMore.set(true);
    const handle = this.searchTerm().trim() || undefined;

    this.customerService.getCustomers(PAGE_SIZE, handle, token).subscribe({
      next: (res) => {
        const existing = this.customers();
        const existingHandles = new Set(existing.map((c) => c.handle));
        const newItems = res.content.filter((c) => !existingHandles.has(c.handle));

        this.customers.set([...existing, ...newItems]);

        const nextToken = res.next_page_token ?? null;
        // If the backend returns no new items or repeats the same token,
        // stop pagination to avoid looping on the same page.
        this.nextPageToken.set(
          newItems.length === 0 || nextToken === token ? null : nextToken,
        );
        this.loadingMore.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(this.errorMapper.toMessage(err, 'customers.list'));
        this.loadingMore.set(false);
      },
    });
  }
}
