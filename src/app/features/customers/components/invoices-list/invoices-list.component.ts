import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Invoice } from '../../../../shared/models/invoice.model';

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
  imports: [DatePipe],
  templateUrl: './invoices-list.component.html',
  styleUrl: './invoices-list.component.css',
})
export class InvoicesListComponent {
  invoices = input.required<Invoice[]>();

  stateDisplay(state: string): InvoiceStateDisplay {
    const normalized = state?.toLowerCase() ?? '';
    return KNOWN_STATES.includes(normalized as (typeof KNOWN_STATES)[number])
      ? (normalized as InvoiceStateDisplay)
      : 'unknown';
  }
}
