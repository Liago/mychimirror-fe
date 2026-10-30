import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		letterSpacing: {
			widest: ".3em",
		},
		extend: {
			screens: {
				// Il tema WordPress passa all'header desktop sopra i 1024px
				desk: "1025px",
			},
			fontFamily: {
				cinzel: ["var(--font-cinzel)", ...defaultTheme.fontFamily.serif],
				cormorant: [
					"var(--font-cormorant-garamond)",
					...defaultTheme.fontFamily.serif,
				],
				playfair: [
					"var(--font-playfair-display)",
					...defaultTheme.fontFamily.serif,
				],
				"open-sans": [
					"var(--font-open-sans)",
					...defaultTheme.fontFamily.sans,
				],
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			colors: {
				"fake-black": "#6A5921",
				nocciola: "#FAF2ED",
				"book-description": "#7A7A78",
				// Colori del tema WordPress (Belletrist)
				"body-text": "#4D4D4D",
				separator: "#9E9E9E",
				"mobile-header": "#DFDCCF",
				"mobile-menu": "#F7F7F6",
				// Valori ereditati dal tema NextUI (rimosso), per non cambiare l'aspetto
				foreground: "#11181C",
				"default-500": "#71717A",
				divider: "rgba(17, 17, 17, 0.15)",
			},
			fontSize: {
				tiny: ["0.75rem", { lineHeight: "1rem" }],
				small: ["0.875rem", { lineHeight: "1.25rem" }],
			},
			borderRadius: {
				large: "14px",
			},
			boxShadow: {
				small:
					"0px 0px 5px 0px rgb(0 0 0 / 0.02), 0px 2px 10px 0px rgb(0 0 0 / 0.06), 0px 0px 1px 0px rgb(0 0 0 / 0.3)",
				medium:
					"0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)",
			},
		},
	},
	plugins: [aspectRatio],
};
export default config;
