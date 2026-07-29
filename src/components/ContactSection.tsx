"use client";

import React, { useState } from "react";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import LetterRevealText from "./LetterRevealText";
import MagneticButtonWrapper from "./MagneticButtonWrapper";
import { useTranslations } from "next-intl";

export default function ContactSection() {
  const t = useTranslations("Contact");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const InputField = ({ label, id, type = "text", required = false }: any) => (
    <div className="relative w-full mb-8">
      <label htmlFor={id} className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        id={id}
        required={required}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        className="w-full bg-transparent border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder-transparent focus:outline-none transition-colors"
        placeholder={label}
      />
      {/* Animated Underline */}
      <div 
        className={`absolute bottom-0 left-0 h-[2px] bg-[#0B0B0C] transition-all duration-300 ease-out ${focusedField === id ? 'w-full' : 'w-0'}`} 
      />
    </div>
  );

  return (
    <section className="relative w-full flex flex-col" id="contact">
      
      {/* Top Banner: Grayscale Image + Subtle Lime Tint */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-[#0B0B0C] flex items-center">
        {/* Grayscale Background */}
        <div className="absolute inset-0 grayscale opacity-60">
          <Image 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop"
            alt="Corporate Experts"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Subtle Accent Tint Overlay using mix-blend */}
        <div className="absolute inset-0 bg-[#d9c2a0]/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] to-transparent opacity-80" />
        
        {/* Heading */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 w-full">
          <div className="max-w-2xl lg:max-w-xl">
            <LetterRevealText 
              text={t("heading")}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight"
            />
          </div>
        </div>
      </div>

      {/* Bottom Dark Section */}
      <div className="relative w-full bg-[#0B0B0C] pt-12 lg:pt-16 pb-12 lg:pb-16 text-white">
        <div className="container mx-auto px-6 md:px-12 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
            
            {/* Left Info Column */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col lg:pr-16 order-2 lg:order-1"
            >
              <p className="text-[#E4E2DF] text-lg leading-relaxed mb-12">
                {t("desc")}
              </p>
              
              <div className="flex flex-col gap-10">
                {/* Address Block */}
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 border border-white/5">
                    <MapPin className="text-[#d9c2a0]" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-2">{t("address")}</h4>
                    <p className="text-[#8A8A87] leading-relaxed">
                      {t("addressLine1")}<br/>
                      {t("addressLine2")}
                    </p>
                  </div>
                </div>

                {/* Contact Block */}
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 border border-white/5">
                    <Phone className="text-[#d9c2a0]" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl mb-2">{t("contact")}</h4>
                    <p className="text-[#8A8A87] leading-relaxed">
                      <a href="tel:+994123456789" className="hover:text-white transition-colors block mb-1">+994 12 345 6789</a>
                      <a href="mailto:hello@the9thway.com" className="hover:text-white transition-colors">hello@the9thway.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Floating Form Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-1 lg:order-2 w-full relative z-20 mt-[-80px] lg:mt-[-350px]"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-[#E4E2DF]">
                
                <h3 className="text-3xl font-semibold text-[#0B0B0C] mb-10">{t("formHeading")}</h3>
                
                <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
                    <InputField label={t("fullName")} id="name" />
                    <InputField label={t("phone")} id="phone" />
                  </div>
                  
                  <InputField label={t("email")} id="email" type="email" required />
                  
                  {/* Textarea */}
                  <div className="relative w-full mb-12">
                    <label htmlFor="message" className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
                      {t("message")} *
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder-transparent focus:outline-none transition-colors resize-none"
                      placeholder={t("message")}
                    />
                    <div className={`absolute bottom-1.5 left-0 h-[2px] bg-[#0B0B0C] transition-all duration-300 ease-out ${focusedField === "message" ? 'w-full' : 'w-0'}`} />
                  </div>

                  <div className="self-start">
                    <MagneticButtonWrapper pullStrength={0.1}>
                      <button 
                        type="submit" 
                        className="bg-[#d9c2a0] text-[#0B0B0C] px-10 py-4 rounded-full font-bold hover:bg-[#0B0B0C] hover:text-[#d9c2a0] transition-colors duration-300 shadow-md hover:shadow-lg border border-transparent hover:border-[#d9c2a0]"
                      >
                        {t("submit")}
                      </button>
                    </MagneticButtonWrapper>
                  </div>

                </form>

              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
