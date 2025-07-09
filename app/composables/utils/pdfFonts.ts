// PDF Font utilities for dynamic language support

export interface FontOptions {
  locale: 'km' | 'en';
}

/**
 * Get column headers dynamically based on locale using i18n
 */
export function getPDFHeaders(t: Function): Array<{ key: string; label: string }> {
  return [
    { key: "total_amount", label: t("total_amount") },
    { key: "currency_id", label: t("settlement.currency") },
    { key: "created_date", label: t("settlement_history_details.settlement_date") },
    { key: "total_supplier", label: t("settlement_history_details.total_supplier") },
    { key: "created_by", label: t("settled_by") },
  ];
}

/**
 * Get PDF titles dynamically based on locale using i18n
 */
export function getPDFTitles(t: Function): { title: string; subtitle: string } {
  return {
    title: t('pdf_export.settlement_report'),
    subtitle: t('pdf_export.direct_debit_settlement_summary')
  };
}

/**
 * Get period text dynamically
 */
export function getPeriodText(t: Function, startDate: string, endDate: string): string {
  return `${t('pdf_export.period')}: ${startDate} ${t('to')} ${endDate}`;
}

/**
 * Get company text dynamically
 */
export function getCompanyText(t: Function, company: string): string {
  return `${t('pdf_export.company')}: ${company}`;
}

/**
 * Get currency text dynamically
 */
export function getCurrencyText(t: Function, currency: string): string {
  return `${t('pdf_export.currency_label')}: ${currency}`;
}

/**
 * Get total text dynamically
 */
export function getTotalText(t: Function, amount: number, currency: string, locale: 'km' | 'en'): string {
  const formattedAmount = amount.toLocaleString(locale === 'km' ? 'km-KH' : 'en-US');
  return `${t('pdf_export.total')}: ${formattedAmount} ${currency}`;
}

/**
 * Get footer text dynamically
 */
export function getFooterText(t: Function, locale: 'km' | 'en'): string {
  const date = new Date().toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US');
  return `${t('pdf_export.generated_on')}: ${date}`;
}

/**
 * Get page text dynamically
 */
export function getPageText(t: Function, pageNumber: number): string {
  return `${t('pdf_export.page')} ${pageNumber}`;
}
