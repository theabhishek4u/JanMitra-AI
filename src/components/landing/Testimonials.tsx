"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rahul Sharma",
    location: "Gomti Nagar, Lucknow",
    avatar: "RS",
    rating: 5,
    text: "मेरी शिकायत 2 दिन में हल हो गई! पहले तो हफ्तों लग जाते थे। AI ने सीधे नगर निगम को भेज दिया।",
    textEn: "My complaint was resolved in 2 days! Earlier it used to take weeks. AI directly routed it to Nagar Nigam.",
  },
  {
    name: "Priya Verma",
    location: "Aliganj, Lucknow",
    avatar: "PV",
    rating: 5,
    text: "Hindi में बोलकर शिकायत दर्ज कर दी। बहुत आसान! हर स्टेप का अपडेट मिलता रहा।",
    textEn: "Filed complaint by speaking in Hindi. So easy! Got updates at every step.",
  },
  {
    name: "Sanjay Tiwari",
    location: "Chinhat, Lucknow",
    avatar: "ST",
    rating: 4,
    text: "सबसे अच्छी बात यह है कि अगर कोई काम नहीं करता तो AI खुद उनको याद दिलाता है।",
    textEn: "Best part is if no one acts, AI itself reminds them automatically.",
  },
  {
    name: "Meena Devi",
    location: "Chowk, Lucknow",
    avatar: "MD",
    rating: 5,
    text: "फोटो भेजा, AI ने पहचान लिया कि सड़क टूटी है। बिना कुछ लिखे शिकायत दर्ज हो गई!",
    textEn: "Sent a photo, AI recognized the broken road. Complaint filed without typing anything!",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Trusted by <span className="gradient-text">Citizens</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from real people across Uttar Pradesh.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="glass-card rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <Quote className="w-8 h-8 text-primary/20 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-base leading-relaxed mb-4">
                    &ldquo;{t.textEn}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.location}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-3.5 h-3.5 fill-warning-amber text-warning-amber"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
