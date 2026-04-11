import type { InvoicePdfData } from './InvoicePdf';

/**
 * Lazily builds an invoice PDF and triggers a browser download.
 *
 * `@react-pdf/renderer` and the invoice layout are both heavy and only
 * needed when the user clicks the Print/Download button — the dynamic
 * `import()` below splits them into a separate chunk so the rest of the
 * app isn't paying for them on initial load.
 */
export async function downloadInvoicePdf(
  data: InvoicePdfData,
  filename?: string,
): Promise<void> {
  const [{ pdf }, { InvoicePdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./InvoicePdf'),
  ]);

  const blob = await pdf(<InvoicePdf data={data} />).toBlob();

  const defaultName =
    data.variant === 'sales'
      ? `invoice-${data.documentNumber || 'sales'}.pdf`
      : `bill-${data.documentNumber || 'purchase'}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
