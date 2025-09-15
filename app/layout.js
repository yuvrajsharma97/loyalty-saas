import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/providers/SessionProvider";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata = {
  title: "LoyaltyOS - Digital Loyalty Programs That Actually Work",
  description:
    "Create QR-based loyalty programs, approve visits in seconds, reward your best customers. Perfect for UK cafes, salons, barbers, and bakeries.",
  keywords:
    "loyalty program, QR code loyalty, customer retention, small business, UK",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-theme="light" className="loyaltyos-theme">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css"
          rel="stylesheet"
          type="text/css"
        />
      </head>
      <body className="antialiased" style={{backgroundColor: '#D0D8C3', color: '#014421'}}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
