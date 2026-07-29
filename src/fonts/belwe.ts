// src/fonts/belwe.ts

// TODO: The user will provide the real Belwe .woff2 files later.
// When they are available, place them in `src/fonts/belwe/` and uncomment the `localFont` code below.
// For now, we mock the variable so the build doesn't fail.

/*
import localFont from 'next/font/local';

export const belwe = localFont({
  src: [
    { path: './belwe/Belwe-Medium.woff2', weight: '500', style: 'normal' },
    { path: './belwe/Belwe-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-belwe',
  display: 'swap',
});
*/

export const belwe = {
  variable: '--font-belwe',
  className: 'font-belwe',
};
