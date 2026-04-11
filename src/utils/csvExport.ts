/**
 * Simple CSV export helper.
 *
 * Pass the rows to export and the column definitions. Each column has a
 * header label and either a key into the row object or a getter function.
 * The helper builds a CSV string, wraps it in a Blob, and triggers a download
 * with the provided filename.
 */
export interface CsvColumn<T> {
  header: string;
  /** Either a key into the row, or a function returning the cell value. */
  value: keyof T | ((row: T) => string | number | null | undefined);
}

const escapeCsvCell = (raw: unknown): string => {
  if (raw === null || raw === undefined) return '';
  const str = String(raw);
  // Quote the cell if it contains a comma, quote, or newline
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportToCsv = <T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void => {
  const headerRow = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const dataRows = rows.map((row) =>
    columns
      .map((c) => {
        const cell = typeof c.value === 'function' ? c.value(row) : row[c.value];
        return escapeCsvCell(cell);
      })
      .join(','),
  );

  // Prepend a BOM so Excel recognises UTF-8
  const csv = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
