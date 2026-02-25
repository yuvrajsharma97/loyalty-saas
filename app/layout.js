import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/providers/SessionProvider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export const metadata = {
  title: "LoyaltyOS - Digital Loyalty Programs That Actually Work",
  description:
    "Create QR-based loyalty programs, approve visits in seconds, reward your best customers. Perfect for UK cafes, salons, barbers, and bakeries.",
  keywords:
    "loyalty program, QR code loyalty, customer retention, small business, UK",
  icons: {
    icon: "/loyaltyLogo.svg"
  }
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-theme="dark" className="dark loyaltyos-theme">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css"
          rel="stylesheet"
          type="text/css" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              })();
            `
          }} />
      </head>
      <body className="antialiased bg-zinc-900 text-white">
        <SessionProvider session={session}>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </SessionProvider>
      </body>
    </html>);
}
