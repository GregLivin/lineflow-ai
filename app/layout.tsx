import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./model-parts.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "LineFlow AI",
  description: "Real-time material request and delivery system for production teams.",
  manifest: "/manifest.webmanifest",
  applicationName: "LineFlow AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LineFlow AI",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
