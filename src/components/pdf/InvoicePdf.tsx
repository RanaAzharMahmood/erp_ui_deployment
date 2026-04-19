import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Path,
} from '@react-pdf/renderer';

// Brand palette — must stay hex literals, @react-pdf doesn't read CSS vars
const ORANGE = '#FF6B35';
const ORANGE_SOFT = '#FFF1EA';
const BORDER = '#E5E7EB';
const TEXT = '#1F2937';
const MUTED = '#6B7280';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: TEXT,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    maxHeight: 60,
    maxWidth: 180,
    objectFit: 'contain',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: TEXT,
    marginRight: 12,
  },
  titleRule: {
    flex: 1,
    height: 1,
    backgroundColor: TEXT,
  },
  headerCols: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  headerCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  headerLabel: {
    color: ORANGE,
    fontFamily: 'Helvetica-Bold',
    marginRight: 4,
  },
  headerValue: {
    color: TEXT,
  },
  tableWrap: {
    borderRightWidth: 2,
    borderRightColor: ORANGE,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: ORANGE,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  th: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: ORANGE_SOFT,
  },
  td: {
    fontSize: 9,
    paddingHorizontal: 4,
  },
  // Column widths sum to 100%
  colQty: { width: '10%' },
  colDesc: { width: '22%' },
  colUnitPrice: { width: '12%', textAlign: 'right' },
  colValueEx: { width: '14%', textAlign: 'right' },
  colTaxRate: { width: '10%', textAlign: 'right' },
  colTaxValue: { width: '14%', textAlign: 'right' },
  colValueIn: { width: '18%', textAlign: 'right' },
  totals: {
    marginTop: 8,
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    color: MUTED,
  },
  totalValue: {
    color: TEXT,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 4,
    paddingTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: MUTED,
  },
});

export interface InvoicePdfLine {
  quantity: number;
  description: string;
  unitPrice: number;
  taxRatePercent: number;
}

export interface InvoicePdfData {
  variant: 'sales' | 'purchase' | 'sales-return' | 'purchase-return';
  /** Sales: invoice number. Purchase: bill number. Return variants: return number. */
  documentNumber: string;
  date: string;
  /** Seller company — renders in the left column (tax IDs) and right column (representor/phone/address). */
  company: {
    name: string;
    logoUrl?: string;
    salesTaxNumber?: string;
    ntnNumber?: string;
    representator?: string;
    phone?: string;
    address?: string;
  };
  /** Selected customer/vendor — only the name is shown in the header. */
  party: {
    name: string;
  };
  lines: InvoicePdfLine[];
  /** Percentage, 0-99. The actual discount amount is derived from gross at render time. */
  discountPercent: number;
  paidAmount: number;
}

const formatPkr = (value: number): string => {
  const formatted = value.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `PKR ${formatted}`;
};

const formatDate = (value: string): string => {
  if (!value) return '';
  // Keep as-is when it's already human-readable (e.g. "12/12/2026")
  if (value.includes('/')) return value;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return value;
  }
};

/**
 * Inline vector version of the Petrozen logo so the PDF has the real brand
 * mark rather than a rasterised fallback. Paths are lifted from the SVG at
 * `src/assets/images/petrozen-logo.svg`.
 */
const PetrozenLogo: React.FC = () => (
  <Svg viewBox="0 0 126 44" style={{ width: 126, height: 44 }}>
    <Path
      d="M15.7631 41.1884C15.8719 41.3624 15.9807 41.5413 16.0895 41.7154L12.1319 44C11.6508 43.2336 11.1745 42.4648 10.6959 41.696C9.62728 39.982 8.55871 38.2679 7.4853 36.5539C6.48201 35.0477 5.55849 33.4884 4.6108 31.9484C3.70904 30.4833 2.713 29.069 1.87651 27.5653C1.74838 27.3356 1.6275 27.1059 1.50904 26.8738C0.800688 25.4716 0.331677 23.9534 0.123765 22.3989C0.0125558 21.5552 -0.0237079 20.7042 0.0149734 19.858C0.319589 13.0163 5.573 7.38088 12.26 6.49121C12.2624 6.5178 12.2624 6.53956 12.2624 6.56374C12.3035 8.32616 11.9796 10.0015 11.322 11.4593C7.46596 12.6585 4.66157 16.2558 4.66157 20.5084C4.66157 23.1919 6.00332 25.3363 7.35717 27.5363C8.30003 29.0666 9.24047 30.5969 10.1833 32.1248C11.2785 33.9018 12.3712 35.6787 13.4664 37.458C14.2328 38.7031 14.9967 39.9433 15.7607 41.1884H15.7631Z"
      fill="#231F20"
    />
    <Path
      d="M28.2861 20.5084C28.2861 25.2154 25.9846 29.3857 22.4476 31.9556C19.4281 34.1532 15.1611 33.1838 13.2947 29.949C13.5751 29.9756 13.8556 29.9877 14.1408 29.9877C14.5035 29.9877 14.8637 29.9684 15.2167 29.9273C15.6784 29.8765 16.1329 29.7895 16.5729 29.671C20.8303 28.5468 23.9127 24.5288 23.596 19.8459C23.4171 17.2325 22.16 14.8972 20.2646 13.287C20.3564 12.5158 20.3443 11.7035 20.2259 10.867C20.047 9.60507 19.6698 8.41562 19.1887 7.29144C24.5074 9.32463 28.2837 14.4741 28.2837 20.5084H28.2861Z"
      fill="#231F20"
    />
    <Path
      d="M18.5432 12.1218C18.5601 13.1637 18.3619 14.2057 17.8735 15.1196C17.1482 16.4807 15.8597 17.4332 14.7548 18.509C13.708 19.5316 12.7942 20.7187 12.2599 22.0798C11.7232 23.4409 11.5926 24.993 12.081 26.371C11.0076 25.9479 9.98252 25.3556 9.19439 24.5167C8.40143 23.6754 7.85989 22.5705 7.83571 21.4198C7.81395 20.3029 8.26846 19.227 8.84143 18.2697C9.94143 16.4299 11.4983 14.8851 12.5355 13.0066C12.8788 12.3877 13.1568 11.7374 13.3792 11.0653C13.8676 9.60989 14.0755 8.0578 14.0392 6.52505C14.0368 6.47187 14.0368 6.41868 14.0344 6.36549C13.957 4.17758 13.401 2.01868 12.55 0C12.7216 0.408571 13.2197 0.829231 13.4904 1.18945C13.8168 1.61978 14.1335 2.05494 14.4405 2.49978C15.0546 3.38945 15.63 4.3033 16.1619 5.2389C16.423 5.69824 16.6792 6.16483 16.9234 6.6411C17.6463 8.0578 18.2482 9.54945 18.4707 11.1209C18.5166 11.4545 18.5432 11.7881 18.548 12.1266L18.5432 12.1218Z"
      fill="#EF6C32"
    />
    <Path
      d="M19.324 22.7035C18.2216 24.1468 16.3045 24.9905 15.7121 26.707C15.219 25.6143 14.9675 24.4152 14.982 23.2136C14.9893 22.5875 15.086 21.9178 15.4946 21.4415C15.879 20.9943 16.4616 20.7936 16.9717 20.5035C17.946 19.9499 18.6979 19.0119 19.0267 17.9409C19.1693 17.4839 19.2491 16.4323 19.7471 16.2389C20.8809 18.0158 20.5667 21.0741 19.324 22.7011V22.7035Z"
      fill="#EF6C32"
    />
  </Svg>
);

const HeaderField: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <View style={styles.headerRow}>
    <Text style={styles.headerLabel}>{label}:</Text>
    <Text style={styles.headerValue}>{value || '—'}</Text>
  </View>
);

export const InvoicePdf: React.FC<{ data: InvoicePdfData }> = ({ data }) => {
  const documentLabel =
    data.variant === 'sales'
      ? 'Invoice Number'
      : data.variant === 'purchase'
        ? 'Bill Number'
        : data.variant === 'sales-return'
          ? 'Sales Return Number'
          : 'Purchase Return Number';

  // Line totals
  const lineRows = data.lines.map((line) => {
    const valueEx = line.quantity * line.unitPrice;
    const taxValue = (valueEx * line.taxRatePercent) / 100;
    const valueIn = valueEx + taxValue;
    return { ...line, valueEx, taxValue, valueIn };
  });

  const grossAmount = lineRows.reduce((sum, l) => sum + l.valueEx, 0);
  const taxTotal = lineRows.reduce((sum, l) => sum + l.taxValue, 0);
  const discountAmount = (grossAmount * (data.discountPercent || 0)) / 100;
  const totalAmount = grossAmount + taxTotal - discountAmount;
  const balance = totalAmount - data.paidAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        <View style={styles.logoRow}>
          {data.company.logoUrl ? (
            <Image src={data.company.logoUrl} style={styles.logoImage} />
          ) : (
            <PetrozenLogo />
          )}
          <Text style={{ fontSize: 8, color: MUTED, marginTop: 4, letterSpacing: 1 }}>
            {data.company.name}
          </Text>
        </View>

        {/* Title rule */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.titleRule} />
        </View>

        {/* Two-column header */}
        <View style={styles.headerCols}>
          <View style={styles.headerCol}>
            <HeaderField label={documentLabel} value={data.documentNumber} />
            <HeaderField label="Sales Tax Number" value={data.company.salesTaxNumber} />
            <HeaderField label="NTN" value={data.company.ntnNumber} />
            <HeaderField label="Date" value={formatDate(data.date)} />
          </View>
          <View style={styles.headerCol}>
            <HeaderField label="Party Name" value={data.party.name} />
            <HeaderField label="Representator" value={data.company.representator} />
            <HeaderField label="Phone No" value={data.company.phone} />
            <HeaderField label="Address" value={data.company.address} />
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colQty]}>Qty(Bulk)</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.th, styles.colValueEx]}>Value-Ex Sales Tax</Text>
            <Text style={[styles.th, styles.colTaxRate]}>Sales Tax Rate</Text>
            <Text style={[styles.th, styles.colTaxValue]}>Sales Tax Value</Text>
            <Text style={[styles.th, styles.colValueIn]}>Value-In Sales Tax</Text>
          </View>
          {lineRows.map((line, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.td, styles.colQty]}>{line.quantity}</Text>
              <Text style={[styles.td, styles.colDesc]}>{line.description}</Text>
              <Text style={[styles.td, styles.colUnitPrice]}>{line.unitPrice.toFixed(2)}</Text>
              <Text style={[styles.td, styles.colValueEx]}>{line.valueEx.toFixed(2)}</Text>
              <Text style={[styles.td, styles.colTaxRate]}>{line.taxRatePercent}%</Text>
              <Text style={[styles.td, styles.colTaxValue]}>{line.taxValue.toFixed(2)}</Text>
              <Text style={[styles.td, styles.colValueIn]}>{line.valueIn.toFixed(2)}</Text>
            </View>
          ))}
          {lineRows.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center', color: MUTED }]}>
                No line items
              </Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SUB TOTAL:</Text>
            <Text style={styles.totalValue}>{formatPkr(grossAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>{formatPkr(taxTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Discount ({data.discountPercent || 0}%):
            </Text>
            <Text style={styles.totalValue}>{formatPkr(discountAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Paid Amount:</Text>
            <Text style={styles.totalValue}>{formatPkr(data.paidAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Balance:</Text>
            <Text style={styles.totalValue}>{formatPkr(balance)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold', color: TEXT }]}>
              Total Amount:
            </Text>
            <Text style={[styles.totalValue, { fontFamily: 'Helvetica-Bold' }]}>
              {formatPkr(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Footer disclaimer */}
        <Text style={styles.footer}>
          This is Computer Generated Invoice does not required any signature.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePdf;
