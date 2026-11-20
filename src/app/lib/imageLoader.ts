import type { ImageLoaderProps } from "next/image";

// Le immagini caricate su WordPress vengono ridimensionate dalla CDN gratuita di Jetpack
// (Photon, i0.wp.com) invece che dall'ottimizzazione di Vercel: il piano Hobby include
// solo 5.000 trasformazioni al mese e oltre risponde 402 (immagine rotta).
// Photon converte in WebP se il browser lo accetta e tiene la cache per 2 anni; un file in
// /wp-content/uploads/ non cambia senza cambiare nome.
// L'originale viene preso da cms. (www lo inoltrerebbe comunque, ma passando da Vercel).
const UPLOADS = /^(?:https?:)?\/\/(?:www|cms)\.mychicmirror\.com\/wp-content\/uploads\//;

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (UPLOADS.test(src)) {
    const path = src.replace(UPLOADS, "");
    return `https://i0.wp.com/cms.mychicmirror.com/wp-content/uploads/${path}?w=${width}&quality=${quality ?? 75}&strip=info`;
  }
  // Altre immagini (copertine YouTube, file locali): servite così come sono
  return src;
}
