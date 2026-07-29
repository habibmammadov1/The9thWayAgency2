# The9thway Agency - Frontend Architecture

This is the production-ready frontend for The9thway Agency, built as a monolithic Next.js 14 application using the App Router. It is designed to be highly performant, accessible, and cinematic.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation Engine**: Framer Motion & GSAP
- **Scroll Hijacking**: Lenis
- **Sliders**: Embla Carousel (with Autoplay plugin)
- **Icons**: Lucide React

## Key Features
- **Cinematic Smooth Scrolling**: Lenis is globally configured.
- **Scroll-Triggered Reveals**: Framer Motion `whileInView` implementations on cards and stats.
- **Asymmetric Clip-Paths**: Performance-friendly CSS border-radius manipulation simulating SVG masks.
- **Performance Optimized**: Native `<Image />` tags across the site with optimized `remotePatterns`.
- **Accessibility Compliant**: Honors user OS `prefers-reduced-motion` settings globally, disabling heavy parallax and marquee effects.

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) to view the site.*

3. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Component Architecture
- `HeroCarousel`: 100vh cinematic slider with staggered entry animations.
- `SmoothScrollProvider`: Global Lenis wrapper context.
- `MagneticButton`: Friction-based hover interaction physics for primary CTAs.
- `AnimatedCounter`: Spring-physics based viewport counters.
- `Testimonials` & `TeamMembers`: Complex CSS grids integrated with Embla.
