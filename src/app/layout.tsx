import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Traza Training Hub",
  description:
    "Interview preparation for Traza AI — freight forwarding & AI automation",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} h-screen-safe bg-background text-foreground antialiased overflow-hidden`}
        >
          <TooltipProvider>
            <SidebarProvider className="h-full !min-h-0 overflow-hidden">
              <AppSidebar />
              <SidebarInset>
                <main className="flex-1 h-full overflow-hidden">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
