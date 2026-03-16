import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ApiError } from '../../../../core/services/api.service';

const PAGE_SIZE = 50;

@Component({
  selector: 'app-customers-list-page',
  standalone: true,
  imports: [DatePipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './customers-list-page.component.html',
  styleUrl: './customers-list-page.component.css',
})
export class CustomersListPageComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges$ = new Subject<string>();

  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');

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
    this.customerService.getCustomers(PAGE_SIZE, handle).subscribe({
      next: (res) => {
        this.customers.set(res.content);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message ?? 'Failed to load customers');
        this.customers.set([]);
        this.loading.set(false);
      },
    });
  }
}
