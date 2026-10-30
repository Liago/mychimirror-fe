import { permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// I post stanno alla radice come su WordPress: /posts/<slug>/ era il vecchio URL di questa app
export default async function LegacyPostRedirect({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/${slug}/`);
}
