# CLAUDE.md

Frontend headless in Next.js per **www.mychicmirror.com** (blog/sito d'autore di Melissa Cecchini + piccolo shop WooCommerce). L'obiettivo è sostituire il frontend WordPress (tema Belletrist + Elementor) con questa app, deployata su Vercel, lasciando WordPress come CMS. Il piano di migrazione di riferimento è in `docs/Guida Completa alla Migrazione Headless di mychicmirror.com_ Da WordPress a NextJS su Vercel.md`.

Lingua del progetto: UI e messaggi in italiano; commit in inglese con prefisso conventional (`feat:`, `fix:`, `refactor:`, `chore:`).

## Comandi

```bash
npm run dev     # dev server su http://localhost:3000
npm run build   # build di produzione (fa anche il type-check)
npm run lint    # eslint . (flat config in eslint.config.mjs, preset next/core-web-vitals)
node scripts/check-urls.mjs [baseUrl]   # verifica che tutte le URL delle sitemap del live rispondano 200
```

Non ci sono test automatici. Node 20.

## Stack

- Next.js 16 (App Router, React Server Components, Turbopack) + React 19, TypeScript `strict`
- Tailwind CSS 3, nessuna libreria di componenti (NextUI rimosso: i suoi valori di tema usati — `text-tiny`, `text-small`, `shadow-small/medium`, `rounded-large`, `foreground`, `divider`, `default-500` — sono replicati in `tailwind.config.ts`)
- GraphQL con `fetch` nativo (`lib/wordpress.ts`), nessun client Apollo
- `mysql2` per l'unico accesso diretto al DB (tool admin recensioni)
- Font via `next/font/google` in `src/app/assets/fonts.ts`: Cinzel (titoli), Cormorant Garamond (testo), Playfair Display (corsivi), Montserrat, Open Sans

## Struttura

Tutto il codice sta in `src/app/` (che è anche `baseUrl` di tsconfig). Alias:
`@/components/*`, `@/lib/*`, `@/assets/*`, `@/utility/*`, `@/ui/*`.

```
src/app/
  layout.tsx                      # root layout: font, Header, Footer, ScrollToTop (presenti su tutte le pagine)
  not-found.tsx, error.tsx       # niente loading.tsx alla radice: lo streaming farebbe rispondere 200 a 404 e redirect
  page.tsx                        # home: cover, ultimi 3 post ("Pillole"), press, interviste YouTube, libri+recensioni
  [...uri]/page.tsx               # catch-all: risolve qualsiasi URI WordPress (post, pagina, categoria, tag, /page/N/)
  posts/[slug]/page.tsx           # redirect 308 dal vecchio /posts/<slug>/ a /<slug>/
  admin/reviews-upload/page.tsx   # tool interno (noindex) per caricare recensioni in blocco
  pillole-emotive.tsx             # stub, NON è una route (file fuori da una cartella)
  lib/wordpress.ts                # fetchGraphQL / mutateGraphQL / fetchREST / fetchJSON con cache e tag
  lib/content.ts                  # tipi e query dei contenuti: resolveUri, fetchPostList, fetchAdjacentPosts
  lib/data.ts                     # home, menu, endpoint PHP custom (libri, recensioni, video)
  lib/actions.ts                  # server actions: commenti, recensioni, scroll infinito, form contatti (CF7)
  lib/site.ts                     # SITE_URL
  lib/db.ts                       # pool MySQL lazy
  components/                     # Cards, VideoCards, Book, BookReview, admin/, hoc/Divider, ui/*
  components/ui/header/           # Header (server: legge il menu WP) + HeaderNav (client: voce attiva, menu mobile)
  components/ui/                  # Footer, PageTitle, SectionTitle, Button, WPContent, PostCard, MetroTile, Pagination, form...
  components/views/               # una vista per tipo di contenuto: PostView, PageView, ArchiveView, BlogView, ContactView
  utility/utils.ts                # formatDateTime (it-IT), formatThemeDate ("On MM/DD/YYYY" come il tema)
```

## Sorgenti dati

| Dato | Sorgente | Dove |
|---|---|---|
| Post, pagine, commenti, menu | WPGraphQL `NEXT_PUBLIC_WORDPRESS_API_URL` (oggi `https://www.mychicmirror.com/graphql`) | `lib/data.ts` |
| Creazione commenti | mutation `createComment` WPGraphQL | `lib/actions.ts` |
| Video interviste | `YOUTUBE_VIDEO_DATA` → `/API/fetchVideos.php` (PHP custom sul server WP) | `getYouTubeData` |
| Libri | `BOOKS_EDITED_DATA` → `/API/getBooks.php` | `getBooksData` |
| Recensioni libri | `BOOKS_REVIEWS_DATA` → `/API/getBookReviews.php`; scrittura diretta su tabella MySQL `reviews` | `getBooksReviews`, `bulkCreateReviewsAction` |
| Immagini cover/press | `MAIN_IMAGE_COVER_URL`, `PRESS_COVER_URL` | `page.tsx`, `PressContainer.tsx` |

Stato del backend WordPress (verificato su live):
- WPGraphQL attivo; **WPGraphQL for WooCommerce NON installato** (niente `products`/`cart` in GraphQL) e **niente add-on Yoast per GraphQL** (niente campo `seo`).
- WooCommerce Store API (`/wp-json/wc/store/v1`) è disponibile: alternativa per catalogo e carrello senza installare WooGraphQL.
- Yoast SEO genera le sitemap; plugin rilevanti: Elementor, Contact Form 7, Jetpack, iubenda, WP Statistics, Woo Fly Cart.
- Hosting Aruba (shared), non un VPS: le parti della guida su nginx/certbot non si applicano così come sono.

## Convenzioni

- Data fetching nei Server Component con funzioni in `lib/content.ts`/`lib/data.ts` costruite su `lib/wordpress.ts`. Ogni risposta è in Data Cache per 1h con il tag `wordpress` più tag specifici (`posts`, `uri:<uri>`, `menu`, `videos`, `books`, `reviews`): per invalidare usare `revalidateTag(tag, "max")` o, dentro una server action, `updateTag(tag)`.
- GraphQL per i singoli contenuti, REST (`fetchREST`) per le liste paginate e i post adiacenti: WPGraphQL non ha offset e il suo `dateQuery` ha precisione al giorno.
- Le immagini usano `mediaItemUrl` (originale su `/wp-content/uploads/`), non `sourceUrl` che passa dal CDN Jetpack `i0.wp.com`.
- Nuove pagine WordPress con layout speciale (Elementor, plugin): aggiungerle a `CUSTOM_PAGES` in `[...uri]/page.tsx` con una vista in `components/views/`.
- Le vecchie funzioni di `lib/data.ts` (home, libri, video) restituiscono ancora `{ props: { ... } }` con `any`.
- Next 16: `params`/`searchParams` delle pagine sono `Promise` e vanno attesi.
- Mutazioni tramite server actions in `lib/actions.ts` che ritornano un risultato discriminato `{ ok: true, ... } | { ok: false, error }` con messaggi in italiano; i client component usano `useTransition`.
- HTML da WordPress reso con il componente `WPContent` (classe `.wp-content`, stili dei blocchi Gutenberg in `globals.css`).
- Testi del tema in inglese ("On 04/15/2023", "Prev post", "Comments", "Reply") lasciati come sul live.
- Immagini remote con `next/image`: ogni nuovo host va aggiunto a `images.remotePatterns` in `next.config.js`.
- **Design = replica fedele del tema WordPress (Belletrist).** Prima di implementare un componente, misurare gli stili calcolati sul sito live (font, misure, colori) e riprodurli.
- Token Tailwind del tema: colori `fake-black` (#6A5921, oro: voce attiva/hover e accenti), `nocciola` (#FAF2ED), `body-text` (#4D4D4D), `separator` (#9E9E9E), `mobile-header`, `mobile-menu`, `book-description`; font `font-cinzel` (titoli), `font-cormorant` (testo, default del body 19px/25px), `font-playfair` (corsivi, h6), `font-open-sans` (menu, bottoni). Il codice più vecchio usa ancora `cinzel.className` ecc. da `assets/fonts.ts`: entrambi funzionano.
- Breakpoint `desk` (≥1025px) = passaggio header mobile/desktop del tema. Classe `qodef-content-grid` (da `globals.css`) replica il contenitore del tema con le sue larghezze per breakpoint.
- Componenti base: `SectionTitle` (titolo Cinzel con lineetta), `Button` (bottone nero del tema, link se riceve `href`).
- `trailingSlash: true`: tutti gli URL e i `href` interni finiscono con `/`, come su WordPress.
- Stile codice: tab nei file più vecchi, 2 spazi nei più recenti; Prettier in `.prettierrc`.

## Attenzione

- `.env` non è tracciato (contiene credenziali): le variabili sono documentate in `.env.example`.
- Le pagine WooCommerce (`/shop/`, `/cart/`, `/checkout/`, `/my-account/`) danno 404 finché non arriva lo shop (F3): vedi `SHOP_PAGES`.
- Form contatti: l'invio vero usa reCAPTCHA v3 e funziona solo da un dominio autorizzato per la chiave (non da localhost).
- Quando WordPress passerà su `cms.mychicmirror.com`, vanno aggiornati gli env, `remotePatterns` e gli endpoint PHP in `/API/`.
