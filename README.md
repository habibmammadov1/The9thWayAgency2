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

   **Running the API:**
   - **Via Docker (Recommended)**: Run `docker compose up -d`. The API container automatically uses `server/.env` (where the database host is `postgres`).
   - **Directly on Host**: If you prefer running `npm run dev` inside the `server/` directory, you must temporarily rename `server/.env.local` to `server/.env` (so the database host is `localhost`), or tell your run command to use `.env.local`.

3. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting
- **Admin Panel Saves Not Persisting:** If API calls in the admin panel seem to succeed (showing a success toast) but data doesn't persist upon refresh, an orphaned Node.js process might be holding port `4000`. The frontend requests reach the orphaned process instead of your active backend. 
  - To fix: Kill orphaned processes holding port 4000 by running `npx kill-port 4000` (or `taskkill /PID <PID> /F` on Windows) before restarting the API.

## Component Architecture
- `HeroCarousel`: 100vh cinematic slider with staggered entry animations.
- `SmoothScrollProvider`: Global Lenis wrapper context.
- `MagneticButton`: Friction-based hover interaction physics for primary CTAs.
- `AnimatedCounter`: Spring-physics based viewport counters.
- `Testimonials` & `TeamMembers`: Complex CSS grids integrated with Embla.

## Database Management Safety

> [!WARNING]
> **NEVER run `npx prisma migrate reset` or `docker compose down -v` on this project.**
> This project's database contains real, admin-edited content that cannot be recreated from scratch. Doing so will permanently wipe all updates. If a fresh database is ever genuinely needed, back up first.

