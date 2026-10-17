import type { Metadata, Viewport } from "next";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBottomNav, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontProvider } from "@/components/storefront-provider";
import { ToastNotice } from "@/components/toast-notice";
import "./globals.css";

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
  themeColor: "#f7f7f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GH">
      <body>
        <StorefrontProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <MobileBottomNav />
          <CartDrawer />
          <ToastNotice />
        </StorefrontProvider>
      </body>
    </html>
  );
}
