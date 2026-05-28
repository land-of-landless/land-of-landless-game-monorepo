import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

export const DMSans = DM_Sans({
  weight: ["400"],
  subsets: ["latin"],
  // display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const PoppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const stencilStdBold = localFont({
  src: "../public/fonts/Stencil_Std_Bold.ttf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const molethRegular = localFont({
  src: "../public/fonts/moleth-moleth-regular-400.ttf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const clesmontRegular = localFont({
  src: "../public/fonts/clesmont-clesmont-regular-400.ttf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const lenasRegular = localFont({
  src: "../public/fonts/lenas-lenas-regular-400.ttf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const quantumDashRegular = localFont({
  src: "../public/fonts/quantum-dash-quantum-dash-svg-400.otf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const semangatRegular = localFont({
  src: "../public/fonts/semangat-semangat-regular-400.otf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});

export const semangatBold = localFont({
  src: "../public/fonts/semangat-semangat-bold-700.otf",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
  preload: true,
});
