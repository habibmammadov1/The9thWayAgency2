"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ContactInfoMap() {
  return (
    <section className="w-full bg-white py-20 lg:py-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col items-center justify-center">
          
          {/* Centered Map */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 relative"
          >
            {/* Grayscale Map Container */}
            <div className="absolute inset-0 grayscale-[100%] contrast-[1.1] opacity-90">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d194473.43003050965!2d49.71487532353775!3d40.39450798150499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f6b5e7ae56c6b!2sBaku%2C%20Azerbaijan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {/* Brand Overlay Tint */}
            <div className="absolute inset-0 bg-accent mix-blend-overlay opacity-10 pointer-events-none" />
          </motion.div>

        </div>
        
      </div>
    </section>
  );
}
