// src/fonts/gilroy.ts
// TODO: The user will provide the real Gilroy .woff2 files later.
// When they are available, place them in `src/fonts/gilroy/` and uncomment the `localFont` code below.
// For now, we mock the variable so the build doesn't fail.

/*
import localFont from 'next/font/local';

export const gilroy = localFont({
  src: [
    { path: './gilroy/Gilroy-Regular.woff2', weight: '400', style: 'normal' },
    { path: './gilroy/Gilroy-Medium.woff2', weight: '500', style: 'normal' },
    { path: './gilroy/Gilroy-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});
*/

// Mock object for now to prevent build errors until fonts are added:
export const gilroy = {
  variable: '--font-gilroy',
  className: 'font-gilroy',
};
