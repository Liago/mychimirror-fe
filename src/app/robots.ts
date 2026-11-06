import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	// Staging e anteprime: niente indicizzazione (vedi anche headers() in next.config.js)
	if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "true") {
		return { rules: { userAgent: "*", disallow: "/" } };
	}

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// Pagine personali o di servizio, come nel robots.txt di WooCommerce
			disallow: [
				"/cart/",
				"/checkout/",
				"/my-account/",
				"/*?add-to-cart=",
				"/*?*add-to-cart=",
			],
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
