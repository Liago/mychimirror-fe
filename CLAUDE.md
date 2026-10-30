# CLAUDE.md

Frontend headless in Next.js per **www.mychicmirror.com** (blog/sito d'autore di Melissa Cecchini + piccolo shop WooCommerce). L'obiettivo è sostituire il frontend WordPress (tema Belletrist + Elementor) con questa app, deployata su Vercel, lasciando WordPress come CMS. Il piano di migrazione di riferimento è in `docs/Guida Completa alla Migrazione Headless di mychicmirror.com_ Da WordPress a NextJS su Vercel.md`.

Lingua del progetto: UI e messaggi in italiano; commit in inglese con prefisso conventional (`feat:`, `fix:`, `refactor:`, `chore:`).

## Comandi

```bash
npm run dev     # dev server su http://localhost:3000
npm run build   # build di produzione (fa anche il type-check)
npm run lint    # eslint . (flat config in eslint.config.mjs, preset next/core-web-vitals)
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
  not-found.tsx, error.tsx, loading.tsx
  page.tsx                        # home: cover, ultimi 3 post ("Pillole"), press, interviste YouTube, libri+recensioni
  posts/[slug]/page.tsx           # articolo singolo con commenti annidati e navigazione prev/next
  admin/reviews-upload/page.tsx   # tool interno (noindex) per caricare recensioni in blocco
  pillole-emotive.tsx             # stub, NON è una route (file fuori da una cartella)
  lib/wordpress.ts                # fetchGraphQL / mutateGraphQL / fetchJSON con cache e tag
  lib/data.ts                     # query di dominio (GraphQL WP + endpoint PHP custom)
  lib/actions.ts                  # server actions: createCommentAction, bulkCreateReviewsAction
  lib/db.ts                       # pool MySQL lazy
  components/                     # Cards, VideoCards, Book, BookReview, admin/, hoc/Divider, ui/*
  components/ui/header/           # Header (server: legge il menu WP) + HeaderNav (client: voce attiva, menu mobile)
  components/ui/                  # Footer, SectionTitle, Button e gli altri componenti di pagina
  utility/utils.ts                # formatDateTime (it-IT, UTC)
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

- Data fetching nei Server Component con funzioni in `lib/data.ts` costruite su `fetchGraphQL`/`fetchJSON` di `lib/wordpress.ts`. Ogni risposta è in Data Cache per 1h con il tag `wordpress` più tag specifici (`posts`, `post:<slug>`, `videos`, `books`, `reviews`): per invalidare usare `revalidateTag(tag, "max")` o, dentro una server action, `updateTag(tag)`.
- Le funzioni di `lib/data.ts` restituiscono spesso `{ props: { ... } }` (residuo di `getServerSideProps`) e usano `any`: da tipizzare in F2.
- Next 16: `params`/`searchParams` delle pagine sono `Promise` e vanno attesi.
- Mutazioni tramite server actions in `lib/actions.ts` che ritornano un risultato discriminato `{ ok: true, ... } | { ok: false, error }` con messaggi in italiano; i client component usano `useTransition`.
- HTML da WordPress reso con `dangerouslySetInnerHTML` (classi `post-content prose`).
- Immagini remote con `next/image`: ogni nuovo host va aggiunto a `images.remotePatterns` in `next.config.js`.
- **Design = replica fedele del tema WordPress (Belletrist).** Prima di implementare un componente, misurare gli stili calcolati sul sito live (font, misure, colori) e riprodurli.
- Token Tailwind del tema: colori `fake-black` (#6A5921, oro: voce attiva/hover e accenti), `nocciola` (#FAF2ED), `body-text` (#4D4D4D), `separator` (#9E9E9E), `mobile-header`, `mobile-menu`, `book-description`; font `font-cinzel` (titoli), `font-cormorant` (testo, default del body 19px/25px), `font-playfair` (corsivi, h6), `font-open-sans` (menu, bottoni). Il codice più vecchio usa ancora `cinzel.className` ecc. da `assets/fonts.ts`: entrambi funzionano.
- Breakpoint `desk` (≥1025px) = passaggio header mobile/desktop del tema. Classe `qodef-content-grid` (da `globals.css`) replica il contenitore del tema con le sue larghezze per breakpoint.
- Componenti base: `SectionTitle` (titolo Cinzel con lineetta), `Button` (bottone nero del tema, link se riceve `href`).
- `trailingSlash: true`: tutti gli URL e i `href` interni finiscono con `/`, come su WordPress.
- Stile codice: tab nei file più vecchi, 2 spazi nei più recenti; Prettier in `.prettierrc`.

## Attenzione

- `.env` non è tracciato (contiene credenziali): le variabili sono documentate in `.env.example`.
- Gli URL dei post su WordPress sono alla radice (`/<slug>/`), mentre qui la route è `/posts/[slug]`: va risolto prima del go-live per non perdere SEO.
- Quando WordPress passerà su `cms.mychicmirror.com`, vanno aggiornati gli env, `remotePatterns` e gli endpoint PHP in `/API/`.
