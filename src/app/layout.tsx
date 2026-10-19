import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontChrome } from "@/components/storefront-chrome";
import { StorefrontProvider } from "@/components/storefront-provider";
import { ToastNotice } from "@/components/toast-notice";
import { CapacitorBackButton } from "@/components/capacitor-back-button";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kora Market — Good finds for every day",
  description:
    "Shop thoughtfully picked finds across tech, home, fashion and beauty. Easy delivery across Ghana, with a little more joy in every order.",
  applicationName: "Kora Market",
  appleWebApp: {
    capable: true,
    title: "Kora Market",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f4f6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GH" className={roboto.variable}>
      <body>
        <StorefrontProvider>
          <StorefrontChrome />
          <main>{children}</main>
          <SiteFooter />
          <ToastNotice />
          <CapacitorBackButton />
        </StorefrontProvider>
      </body>
    </html>
  );
}
