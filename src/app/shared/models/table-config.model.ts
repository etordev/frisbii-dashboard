/* Column definition for the generic data table. */
export interface TableColumnConfig<T> {
  /* Property key on the row object, or use formatter for computed values. */
  key: keyof T | string;
  /* Header label. */
  header: string;
  /* Optional formatter for cell display (e.g. concatenate names, format date). */
  formatter?: (row: T) => string;
}

/* Action button definition for the table.*/
export interface TableActionConfig<T> {
  id: string;
  label: string;
  /* If provided, button is shown only when this returns true. */
  visible?: (row: T) => boolean;
}

/* Configuration for the generic data table: columns and optional row actions. */
export interface TableConfig<T> {
  columns: TableColumnConfig<T>[];
  actions?: TableActionConfig<T>[];
}
