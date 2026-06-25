import {Cinzel, Open_Sans, Cormorant_Garamond, Montserrat, Playfair_Display } from 'next/font/google'
 
 
export const openSans = Open_Sans({
	weight: ["400", "600", "800"],
	style: ["normal"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-open-sans",
});

export const cinzel = Cinzel({
	weight: ["400", "600", "800"],
	style: ["normal"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-cinzel",
});
export const cormorantGaramond = Cormorant_Garamond({
    weight: ['400', '600', '700'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-cormorant-garamond',
  })
export const montserrat = Montserrat({
    weight: ['300', '400', '700'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
  })
export const playfairDisplay = Playfair_Display({
    weight: ['400', '600', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-playfair-display',
  })