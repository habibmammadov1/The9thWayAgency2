"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import LetterRevealText from "./LetterRevealText";
import MagneticButtonWrapper from "./MagneticButtonWrapper";
import { useTranslations, useLocale } from "next-intl";
import { submitContactForm } from "@/lib/api";

interface ContactSectionProps {
  info?: {
    address: string;
    phone: string;
    email: string;
    workingHours: string;
  } | null;
  sourcePage?: string;
}

export default function ContactSection({ info, sourcePage = "home" }: ContactSectionProps) {
  const t = useTranslations("Contact");
  const locale = useLocale();

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form Field States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot spam protection
  
  // Submit Action States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addressVal = info?.address || t("addressLine1") + " " + t("addressLine2");
  const phoneVal = info?.phone || "+994 12 345 6789";
  const emailVal = info?.email || "hello@the9thway.com";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = locale === "az" ? "Ad Soyad tələb olunur" : locale === "ru" ? "Имя обязательно" : "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = locale === "az" ? "E-poçt tələb olunur" : locale === "ru" ? "Эл. почта обязательна" : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = locale === "az" ? "Düzgün e-poçt daxil edin" : locale === "ru" ? "Неверный эл. адрес" : "Invalid email address";
    }

    if (!message.trim()) {
      newErrors.message = locale === "az" ? "Mesaj tələb olunur" : locale === "ru" ? "Сообщение обязательно" : "Message is required";
    } else if (message.length < 5) {
      newErrors.message = locale === "az" ? "Mesaj ən az 5 simvol olmalıdır" : locale === "ru" ? "Минимум 5 символов" : "Message must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitContactForm({
        fullName,
        phone: phone || null,
        email,
        message,
        sourcePage,
        locale,
        website, // Honeypot field
      });

      setIsSuccess(true);
      
      // Notify components like admin sidebar to check for new inquiries
      window.dispatchEvent(new Event("submissions-updated"));
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const localizedSuccess: Record<string, { title: string; desc: string }> = {
    az: {
      title: "Təşəkkür edirik!",
      desc: "Mesajınız uğurla göndərildi. Komandamız tezliklə sizinlə əlaqə saxlayacaq."
    },
    en: {
      title: "Thank You!",
      desc: "Your message has been sent successfully. Our team will contact you shortly."
    },
    ru: {
      title: "Спасибо!",
      desc: "Ваше сообщение успешно отправлено. Наша команда свяжется с вами в ближайшее время."
    }
  };
  
  const successText = localizedSuccess[locale] || localizedSuccess.az;

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
              className="flex flex-col lg:pr-16 order-2 lg:order-1 animate-fadeIn"
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
                    <p className="text-[#8A8A87] leading-relaxed whitespace-pre-wrap">
                      {addressVal}
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
                    <p className="text-[#8A8A87] leading-relaxed flex flex-col gap-1">
                      <a href={`tel:${phoneVal.replace(/\s+/g, '')}`} className="hover:text-white transition-colors block">{phoneVal}</a>
                      <a href={`mailto:${emailVal}`} className="hover:text-white transition-colors block">{emailVal}</a>
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
              {isSuccess ? (
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-[#E4E2DF] text-center flex flex-col items-center justify-center min-h-[450px]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-3xl font-display font-bold text-black mb-3">{successText.title}</h3>
                  <p className="text-neutral-500 max-w-sm mb-6 leading-relaxed">
                    {successText.desc}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-[#E4E2DF]">
                  
                  <h3 className="text-3xl font-semibold text-[#0B0B0C] mb-10">{t("formHeading")}</h3>
                  
                  <form className="flex flex-col" onSubmit={handleFormSubmit}>
                    
                    {/* Honeypot Spam Protection Field (Invisible to human visitors) */}
                    <div className="absolute opacity-0 -z-50 pointer-events-none w-0 h-0 overflow-hidden">
                      <label htmlFor="website">Website</label>
                      <input 
                        type="text" 
                        id="website" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        tabIndex={-1} 
                        autoComplete="off" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
                      {/* Name input */}
                      <div className="relative w-full mb-8">
                        <label htmlFor="name" className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
                          {t("fullName")} *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                          }}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full bg-transparent border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder-transparent focus:outline-none transition-colors"
                          placeholder={t("fullName")}
                        />
                        <div className={`absolute bottom-0 left-0 h-[2px] bg-[#0B0B0C] transition-all duration-300 ease-out ${focusedField === "name" ? 'w-full' : 'w-0'}`} />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullName}</p>}
                      </div>

                      {/* Phone input */}
                      <div className="relative w-full mb-8">
                        <label htmlFor="phone" className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
                          {t("phone")}
                        </label>
                        <input
                          type="text"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onFocus={() => setFocusedField("phone")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full bg-transparent border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder-transparent focus:outline-none transition-colors"
                          placeholder={t("phone")}
                        />
                        <div className={`absolute bottom-0 left-0 h-[2px] bg-[#0B0B0C] transition-all duration-300 ease-out ${focusedField === "phone" ? 'w-full' : 'w-0'}`} />
                      </div>
                    </div>
                    
                    {/* Email input */}
                    <div className="relative w-full mb-8">
                      <label htmlFor="email" className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
                        {t("email")} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder-transparent focus:outline-none transition-colors"
                        placeholder={t("email")}
                      />
                      <div className={`absolute bottom-0 left-0 h-[2px] bg-[#0B0B0C] transition-all duration-300 ease-out ${focusedField === "email" ? 'w-full' : 'w-0'}`} />
                      {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                    </div>
                    
                    {/* Message Textarea */}
                    <div className="relative w-full mb-12">
                      <label htmlFor="message" className="block text-xs font-semibold tracking-widest uppercase text-[#8A8A87] mb-2">
                        {t("message")} *
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                        }}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent border-b border-[#E4E2DF] py-3 text-[#0B0B0C] placeholder-transparent focus:outline-none transition-colors resize-none"
                        placeholder={t("message")}
                      />
                      <div className={`absolute bottom-1.5 left-0 h-[2px] bg-[#0B0B0C] transition-all duration-300 ease-out ${focusedField === "message" ? 'w-full' : 'w-0'}`} />
                      {errors.message && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.message}</p>}
                    </div>

                    {submitError && (
                      <p className="text-red-600 text-sm font-semibold mb-6 bg-red-50 p-3 rounded-xl border border-red-200">
                        {submitError}
                      </p>
                    )}

                    <div className="self-start">
                      <MagneticButtonWrapper pullStrength={0.1}>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-[#d9c2a0] text-[#0B0B0C] px-10 py-4 rounded-full font-bold hover:bg-[#0B0B0C] hover:text-[#d9c2a0] transition-colors duration-300 shadow-md hover:shadow-lg border border-transparent hover:border-[#d9c2a0] flex items-center justify-center disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin mr-2" size={16} /> Göndərilir...
                            </>
                          ) : (
                            t("submit")
                          )}
                        </button>
                      </MagneticButtonWrapper>
                    </div>

                  </form>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
