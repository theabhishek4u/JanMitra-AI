import Link from "next/link";
import { Bot, Mail, Phone, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 relative overflow-hidden">
      {/* Ambient background soft glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gov-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-ai-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center relative group/logo">
                <span className="absolute -inset-1 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple opacity-20 blur-[2px] group-hover/logo:opacity-50 transition-opacity" />
                <Bot className="w-5.5 h-5.5 text-white relative z-10" />
              </div>
              <div>
                <div className="font-bold text-lg gradient-text-blue leading-none">JanMitra</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                  AI Governance
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              AI-Powered Smart Governance for faster citizen complaint resolution
              in Uttar Pradesh.
            </p>
          </div>

          {/* Quick Links (Platform) */}
          <div>
            <h3 className="font-bold text-xs mb-4 uppercase tracking-widest text-slate-200">
              Platform
            </h3>
            <ul className="space-y-3">
              {[
                { label: "File Complaint", href: "/citizen" },
                { label: "Track Status", href: "/citizen" },
                { label: "Officer Portal", href: "/officer" },
                { label: "Analytics", href: "/admin" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-xs mb-4 uppercase tracking-widest text-slate-200">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Help Center", href: "/help" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-xs mb-4 uppercase tracking-widest text-slate-200">
              Contact
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm text-slate-400 group/item">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800/80 group-hover/item:border-gov-blue/30 group-hover/item:bg-slate-950 transition-all duration-300">
                  <Phone className="w-3.5 h-3.5 text-gov-blue" />
                </div>
                <span className="group-hover/item:text-slate-200 transition-colors font-medium">1076 (CM Helpline)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400 group/item">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800/80 group-hover/item:border-gov-blue/30 group-hover/item:bg-slate-950 transition-all duration-300">
                  <Phone className="w-3.5 h-3.5 text-gov-blue" />
                </div>
                <span className="group-hover/item:text-slate-200 transition-colors font-medium">1800-180-5531 (Nagar Nigam)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400 group/item">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800/80 group-hover/item:border-ai-purple/30 group-hover/item:bg-slate-950 transition-all duration-300">
                  <Mail className="w-3.5 h-3.5 text-ai-purple" />
                </div>
                <span className="group-hover/item:text-slate-200 transition-colors font-medium">support@janmitra.gov.in</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400 group/item">
                <Link href="/developers" className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800/80 group-hover/item:border-slate-400/30 group-hover/item:bg-slate-950 transition-all duration-300">
                    <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="group-hover/item:text-slate-200 transition-colors font-medium">Developers</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Center-Aligned Copyright Footer Block */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex justify-center">
          <p className="text-xs text-slate-500 font-medium text-center tracking-wide">
            © 2026 JanMitra AI — Government of Uttar Pradesh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
