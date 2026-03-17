import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { TableConfig } from '../../models/table-config.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'data-table',
  standalone: true,
  imports: [NgClass, LoadingSpinnerComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T extends object = object> implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('scrollEl', { static: true })
  private readonly scrollEl?: ElementRef<HTMLElement>;

  data = input.required<T[]>();
  config = input.required<TableConfig<T>>();
  height = input<string | number | undefined>(undefined);
  loadingMore = input<boolean>(false);

  rowClick = output<T>();
  actionClick = output<{ actionId: string; row: T }>();
  bottomReached = output<void>();

  private readonly autoHeightPx = signal<number | null>(null);
  private lastBottomEmitAt = 0;

  readonly resolvedHeight = computed(() => {
    const h = this.height();
    if (h != null) {
      return typeof h === 'number' ? `${h}px` : String(h);
    }

    const px = this.autoHeightPx();
    return px != null ? `${px}px` : 'auto';
  });

  ngAfterViewInit(): void {
    // If no explicit height provided, auto-size to remaining viewport height.
    if (this.height() == null) {
      this.updateAutoHeight();
      fromEvent(window, 'resize')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateAutoHeight());
    }
  }

  onRowClick(row: T, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    this.rowClick.emit(row);
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement | null;
    if (!el) return;

    const thresholdPx = 80;
    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - thresholdPx;

    if (!reachedBottom) return;

    const now = Date.now();
    if (now - this.lastBottomEmitAt < 400) return;
    this.lastBottomEmitAt = now;
    this.bottomReached.emit();
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

  private updateAutoHeight(): void {
    const el = this.scrollEl?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight || 0;

    // Small breathing room so we don't hug the bottom edge.
    const bottomPaddingPx = 16;
    const next = Math.max(200, Math.floor(viewportH - rect.top - bottomPaddingPx));
    this.autoHeightPx.set(next);
  }
}
