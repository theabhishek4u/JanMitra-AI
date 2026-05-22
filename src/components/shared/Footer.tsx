import Link from "next/link";
import { Bot, Github, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg gradient-text-blue">JanMitra</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  AI Governance
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-Powered Smart Governance for faster citizen complaint resolution
              in Uttar Pradesh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-foreground/80">
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { label: "File Complaint", href: "/citizen" },
                { label: "Track Status", href: "/citizen" },
                { label: "Officer Portal", href: "/officer" },
                { label: "Analytics", href: "/admin" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-foreground/80">
              Resources
            </h3>
            <ul className="space-y-2">
              {["API Documentation", "Privacy Policy", "Terms of Service", "Help Center"].map(
                (label) => (
                  <li key={label}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {label}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-foreground/80">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" /> 1076 (CM Helpline)
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> support@janmitra.gov.in
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Github className="w-4 h-4" /> Open Source
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 JanMitra AI — Government of Uttar Pradesh. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
