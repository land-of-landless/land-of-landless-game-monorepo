import { Exo_2, Orbitron } from "next/font/google";

/** Body / UI copy on the play page */
export const exo2 = Exo_2({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-exo-2",
    display: "swap",
});

/** Titles and headers on the play page */
export const orbitron = Orbitron({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-orbitron",
    display: "swap",
});

/** Class names to apply on the /p page root (sets CSS variables + default body font) */
export const playPageFontClassName = `${exo2.variable} ${orbitron.variable} font-exo`;
