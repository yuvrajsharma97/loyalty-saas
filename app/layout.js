import "./globals.css";

export const metadata = {
  title: "LoyaltyOS - Digital Loyalty Programs That Actually Work",
  description:
    "Create QR-based loyalty programs, approve visits in seconds, reward your best customers. Perfect for UK cafes, salons, barbers, and bakeries.",
  keywords:
    "loyalty program, QR code loyalty, customer retention, small business, UK",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="loyaltyos">
      <body className="antialiased">{children}</body>
    </html>
  );
}
