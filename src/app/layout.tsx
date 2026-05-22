import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoTour } from "@/components/landing/DemoTour";
import { AIAssistantWidget } from "@/components/shared/AIAssistantWidget";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JanMitra AI — Smart Grievance Resolution",
  description:
    "AI-Powered Smart Governance for Faster Citizen Complaint Resolution. File complaints, track progress, and get updates in Hindi, English, and Urdu.",
  keywords: [
    "JanMitra",
    "AI",
    "Grievance",
    "Jansunwai",
    "UP Government",
    "Citizen Complaints",
    "Smart Governance",
  ],
  authors: [{ name: "JanMitra AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <TooltipProvider>
          {children}
          <Suspense fallback={null}>
            <DemoTour />
          </Suspense>
          <AIAssistantWidget />
        </TooltipProvider>
      </body>
    </html>
  );
}

