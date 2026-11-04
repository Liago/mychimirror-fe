import { permanentRedirect } from "next/navigation";

import { isLocale, localePath } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

// I post stanno alla radice come su WordPress: /posts/<slug>/ era il vecchio URL di questa app
export default async function LegacyPostRedirect({ params }: PageProps) {
  const { lang, slug } = await params;
  permanentRedirect(localePath(isLocale(lang) ? lang : "it", `/${slug}/`));
}
