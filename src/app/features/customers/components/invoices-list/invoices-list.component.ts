import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Invoice } from '../../../../shared/models/invoice.model';
import { TableConfig } from '../../../../shared/models/table-config.model';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';

const KNOWN_STATES = [
  'created',
  'pending',
  'settled',
  'authorized',
  'failed',
] as const;
export type InvoiceStateDisplay =
  | (typeof KNOWN_STATES)[number]
  | 'unknown';

@Component({
  selector: 'invoices-list',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './invoices-list.component.html',
  styleUrl: './invoices-list.component.css',
})
export class InvoicesListComponent {
  invoices = input.required<Invoice[]>();
  loadingMore = input<boolean>(false);
  bottomReached = output<void>();
  private readonly datePipe = inject(DatePipe);

  readonly invoiceTableConfig: TableConfig<Invoice> = {
    columns: [
      {
        key: 'state',
        header: 'State',
        formatter: (row) => row.state || 'unknown',
        cellClass: (row) =>
          'state-badge state-' + this.stateDisplay(row.state),
      },
      { key: 'handle', header: 'Handle' },
      {
        key: 'amount',
        header: 'Amount',
        formatter: (row) => `${row.amount} ${row.currency}`,
      },
      {
        key: 'created',
        header: 'Created',
        formatter: (row) =>
          this.datePipe.transform(row.created, 'mediumDate') ?? '',
      },
    ],
  };

  stateDisplay(state: string): InvoiceStateDisplay {
    const normalized = state?.toLowerCase() ?? '';
    return KNOWN_STATES.includes(normalized as (typeof KNOWN_STATES)[number])
      ? (normalized as InvoiceStateDisplay)
      : 'unknown';
  }
}
