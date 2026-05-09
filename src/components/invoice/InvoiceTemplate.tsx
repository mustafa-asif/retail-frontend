import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#1e293b'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#334155'
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableColLarge: {
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableColSmall: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCell: {
    margin: 8,
    fontSize: 10
  },
  totals: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsLines: {
    width: '40%'
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  totalsBold: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0f172a',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10
  }
});

interface InvoiceTemplateProps {
  saleId: string | number;
  date: string;
  storeName: string;
  customerName: string;
  customerContact: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export function InvoiceTemplate({
  saleId,
  date,
  storeName,
  customerName,
  customerContact,
  items,
  subtotal,
  tax,
  total,
  paymentMethod
}: InvoiceTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>RETAIL PRO</Text>
            <Text style={styles.subtitle}>Branch: {storeName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Invoice #{saleId}</Text>
            <Text style={styles.subtitle}>Date: {date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{customerName}</Text>
          <Text style={{ marginTop: 4, color: '#64748b' }}>{customerContact}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColLarge}>
              <Text style={styles.tableCell}>Item</Text>
            </View>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCell}>Qty</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Unit Price</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColLarge}>
                <Text style={styles.tableCell}>{item.name}</Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{item.qty}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>PKR {item.price.toLocaleString()}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>PKR {item.total.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsLines}>
            <View style={styles.totalsRow}>
              <Text>Subtotal:</Text>
              <Text>PKR {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Tax (0%):</Text>
              <Text>PKR {tax.toLocaleString()}</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsBold]}>
              <Text>TOTAL:</Text>
              <Text>PKR {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>Payment Info</Text>
          <Text style={{ color: '#64748b' }}>Method: {paymentMethod}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}
