import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// Pagine personali o di servizio, come nel robots.txt di WooCommerce
			disallow: [
				"/cart/",
				"/checkout/",
				"/my-account/",
				"/admin/",
				"/*?add-to-cart=",
				"/*?*add-to-cart=",
			],
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
