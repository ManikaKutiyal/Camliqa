/**
 * Invoice / PDF letterhead (defaults mirror the Zenith-style template).
 * Override with NEXT_PUBLIC_INVOICE_* env vars in `.env.local`.
 */
export function getInvoiceBranding() {
  return {
    companyName: process.env.NEXT_PUBLIC_INVOICE_COMPANY_NAME || "E-COMMERCE ERP",
    address:
      process.env.NEXT_PUBLIC_INVOICE_ADDRESS ||
      "Your Store Address, City, State, India",
    phone: process.env.NEXT_PUBLIC_INVOICE_PHONE || "+91 98765 43210",
    email: process.env.NEXT_PUBLIC_INVOICE_EMAIL || "support@yourstore.com",
    website: process.env.NEXT_PUBLIC_INVOICE_WEBSITE || "www.yourstore.com",
    bankName: process.env.NEXT_PUBLIC_INVOICE_BANK_NAME || "Bank Alfalah",
    bankAccountTitle:
      process.env.NEXT_PUBLIC_INVOICE_BANK_TITLE || "E-COMMERCE ERP",
    bankAccountNo:
      process.env.NEXT_PUBLIC_INVOICE_BANK_ACCOUNT || "0000-0000-0000-0000",
    bankIban: process.env.NEXT_PUBLIC_INVOICE_BANK_IBAN || "PK00XXXX0000000000000000",
    jazzCash: process.env.NEXT_PUBLIC_INVOICE_JAZZCASH || "+92 300 0000000",
    currencySymbol: process.env.NEXT_PUBLIC_INVOICE_CURRENCY_SYMBOL || "₹",
    paymentTermsDays: Number(process.env.NEXT_PUBLIC_INVOICE_NET_DAYS || 15),
    footerNote:
      process.env.NEXT_PUBLIC_INVOICE_NOTES ||
      "Thank you for shopping with us. For returns or support, contact our customer care team.",
    logoPath: "/invoice-brand-logo.png",
  };
}
