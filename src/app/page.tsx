import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthSession } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/landing/Hero";
import { AIPlayground } from "@/components/landing/AIPlayground";
import { Features } from "@/components/landing/Features";
import { DemoWorkflow } from "@/components/landing/DemoWorkflow";
import { Statistics } from "@/components/landing/Statistics";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("janmitra_auth");
  
  if (authCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(authCookie.value)) as AuthSession;
      if (session?.role) {
        if (session.role === "citizen") redirect("/citizen");
        if (session.role === "admin") redirect("/admin");
        if (session.role === "officer") redirect("/officer");
      }
    } catch (e) {
      // Invalid cookie, let it render the landing page
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AIPlayground />
        <Features />
        <DemoWorkflow />
        <Statistics />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

