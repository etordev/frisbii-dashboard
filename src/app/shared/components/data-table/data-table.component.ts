import { Component, input, output } from '@angular/core';
import { TableConfig } from '../../models/table-config.model';

@Component({
  selector: 'data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T extends object = object> {
  data = input.required<T[]>();
  config = input.required<TableConfig<T>>();

  rowClick = output<T>();
  actionClick = output<{ actionId: string; row: T }>();

  onRowClick(row: T, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    this.rowClick.emit(row);
  }

  onActionClick(actionId: string, row: T, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ actionId, row });
  }

  getCellValue(row: T, key: keyof T | string, formatter?: (row: T) => string): string {
    if (formatter) return formatter(row);
    const value = row[key as keyof T];
    return value != null ? String(value) : '';
  }

  isActionVisible(row: T, visible?: (row: T) => boolean): boolean {
    return visible == null || visible(row);
  }
}
