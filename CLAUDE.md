# CLAUDE.md

Frontend headless in Next.js per **www.mychicmirror.com** (blog e libri della scrittrice Cristiana Sammarini + piccolo shop WooCommerce). L'obiettivo è sostituire il frontend WordPress (tema Belletrist + Elementor) con questa app, deployata su Vercel, lasciando WordPress come CMS. Configurazione attuale (DNS, database, Vercel, `wp-config.php`, rollback) in `docs/INFRASTRUTTURA.md`. Il piano di migrazione di riferimento è in `docs/Guida Completa alla Migrazione Headless di mychicmirror.com_ Da WordPress a NextJS su Vercel.md`.

Lingua del progetto: UI e messaggi in italiano; commit in inglese con prefisso conventional (`feat:`, `fix:`, `refactor:`, `chore:`).

## Comandi

```bash
npm run dev     # dev server su http://localhost:3000
npm run build   # build di produzione (fa anche il type-check)
npm run lint    # eslint . (flat config in eslint.config.mjs, preset next/core-web-vitals)
node scripts/check-urls.mjs [baseUrl]   # verifica che le URL storiche (sitemap Yoast su cms) rispondano come previsto; --en per quelle inglesi
```

Non ci sono test automatici. Node 20.

## Stack

- Next.js 16 (App Router, React Server Components, Turbopack) + React 19, TypeScript `strict`
- Tailwind CSS 3, nessuna libreria di componenti (NextUI rimosso: i suoi valori di tema usati — `text-tiny`, `text-small`, `shadow-small/medium`, `rounded-large`, `foreground`, `divider`, `default-500` — sono replicati in `tailwind.config.ts`)
- GraphQL con `fetch` nativo (`lib/wordpress.ts`), nessun client Apollo
- Font via `next/font/google` in `src/app/assets/fonts.ts`: Cinzel (titoli), Cormorant Garamond (testo), Playfair Display (corsivi), Open Sans (menu, bottoni), esposti come variabili CSS su `<html>`

## Struttura

Tutto il codice sta in `src/app/` (che è anche `baseUrl` di tsconfig). Alias:
`@/components/*`, `@/lib/*`, `@/assets/*`, `@/utility/*`, `@/ui/*`.

```
src/app/
  [lang]/                         # tutte le pagine: it sugli URL storici (rewrite in src/proxy.ts), en sotto /en/
  [lang]/layout.tsx               # root layout: font, I18nProvider, Header, Footer, ScrollToTop (presenti su tutte le pagine)
  [lang]/not-found.tsx, error.tsx # niente loading.tsx alla radice: lo streaming farebbe rispondere 200 a 404 e redirect
  [lang]/page.tsx                 # home: cover + ultimi 3 post, rassegna stampa + video, libri con recensioni e citazioni, loghi, newsletter
  [lang]/[...uri]/page.tsx        # catch-all: risolve qualsiasi URI WordPress (post, pagina, categoria, tag, /page/N/)
  [lang]/posts/[slug]/page.tsx    # redirect 308 dal vecchio /posts/<slug>/ a /<slug>/
  [lang]/portfolio-item/press/page.tsx   # rassegna stampa statica (il CPT portfolio-item non è nelle API)
  [lang]/shop/, product/[slug]/, product-category/[slug]/   # catalogo WooCommerce (Store API)
  [lang]/cart/page.tsx            # pagina carrello (client, usa CartProvider)
  checkout/route.ts, my-account/route.ts   # redirect a WordPress (checkout con Cart-Token)
  lib/wordpress.ts                # fetchGraphQL / mutateGraphQL / fetchREST / fetchJSON con cache e tag
  lib/content.ts                  # tipi e query dei contenuti: resolveUri, fetchPostList, fetchAdjacentPosts
  lib/data.ts                     # fetchBooks (libri + recensioni dagli endpoint PHP), fetchMainMenu
  lib/editorial.ts                # contenuti scritti a mano nella vecchia home Elementor (video, stampa, citazioni, loghi, newsletter)
  lib/actions.ts                  # server actions: commenti, recensioni, scroll infinito, form contatti (CF7)
  lib/i18n.ts                     # lingue, localePath, dizionari IT/EN (getDict)
  lib/postLocale.ts               # separa le due lingue di articoli e About: titolo, testo, audio, foto duplicata
  lib/site.ts                     # SITE_URL
  lib/seo.ts                      # metadata da Yoast (yoast_head_json), JSON-LD, schema Product
  lib/revalidate.ts, api/revalidate/route.ts   # revalidazione on-demand: evento WordPress -> tag di cache
  lib/preview.ts, api/preview/, api/exit-preview/, anteprima/[type]/[id]/   # anteprime bozze (Draft Mode)
  sitemap.ts, robots.ts, feed/route.ts, icon.png, apple-icon.png   # SEO, RSS e icone (logo "MM")
  api/shortlink/route.ts          # link brevi WordPress (/?p=123, /?page_id=123) -> indirizzo vero
  lib/shop.ts                     # catalogo: prodotti, categorie, descrizione (REST WP), recensioni, correlati
  lib/cart.ts, lib/cartActions.ts # carrello Store API (Cart-Token in cookie httpOnly) e server action
  components/home/                # sezioni della home: LatestPosts, PressBanner, BookSection, BookPressQuote, RetailerLogos, NewsletterBanner
  components/shop/                # ProductCard/Grid, ProductGallery, AddToCartForm, ProductTabs
  components/cart/                # CartProvider (context), MiniCart (bottone flottante + finestra), CartView, QuantityInput
  components/ui/header/           # Header (server: legge il menu WP) + HeaderNav (client: voce attiva, menu mobile)
  components/ui/                  # Footer, PageTitle, SectionTitle, Button, WPContent, PostCard, MetroTile, Pagination, form...
  components/views/               # una vista per tipo di contenuto: PostView, PageView, ArchiveView, BlogView, ContactView
  utility/utils.ts                # formatThemeDate (date in italiano), cleanText (testi del DB: Windows-1252 ed entità HTML)
```

## Sorgenti dati

| Dato | Sorgente | Dove |
|---|---|---|
| Post, pagine, commenti, menu | WPGraphQL `NEXT_PUBLIC_WORDPRESS_API_URL` (`https://cms.mychicmirror.com/graphql`) | `lib/data.ts` |
| Creazione commenti | mutation `createComment` WPGraphQL | `lib/actions.ts` |
| Libri | `BOOKS_EDITED_DATA` → `/API/getBooks.php` (PHP custom sul server WP) | `fetchBooks` |
| Recensioni libri | `BOOKS_REVIEWS_DATA` → `/API/getBookReviews.php`; scrittura sulla tabella `reviews` di `Sql1291927_2` dalla pagina "Recensioni libri" del pannello WordPress (mu-plugin `mcm-reviews.php`) | `fetchBooks` |
| Prodotti, categorie prodotto | WooCommerce Store API `/wp-json/wc/store/v1/products` (pubblica, via `fetchREST`) | `lib/shop.ts` |
| Carrello | Store API `/cart`, `/cart/add-item`... con header `Cart-Token` (niente nonce) | `lib/cart.ts` |
| Contenuti editoriali della home | scritti a mano in `lib/editorial.ts` (sul vecchio sito erano statici in Elementor) | `components/home/*` |
| Foto di copertina della home | `MAIN_IMAGE_COVER_URL` | `LatestPosts` |

Stato del backend WordPress (verificato su live):
- WPGraphQL attivo; **WPGraphQL for WooCommerce NON installato** (niente `products`/`cart` in GraphQL) e **niente add-on Yoast per GraphQL** (niente campo `seo`).
- WooCommerce Store API (`/wp-json/wc/store/v1`) è disponibile: alternativa per catalogo e carrello senza installare WooGraphQL.
- Yoast SEO genera le sitemap; plugin rilevanti: Elementor, Contact Form 7, Jetpack, iubenda, WP Statistics, Woo Fly Cart.
- Hosting Aruba (shared), non un VPS: le parti della guida su nginx/certbot non si applicano così come sono.

## Convenzioni

- Data fetching nei Server Component con funzioni in `lib/content.ts`/`lib/data.ts` costruite su `lib/wordpress.ts`. Ogni risposta è in Data Cache per 24h (libri e recensioni 1h) con il tag `wordpress` più tag specifici (`posts`, `uri:<uri>`, `menu`, `videos`, `books`, `reviews`): per invalidare usare `revalidateTag(tag, "max")` o, dentro una server action, `updateTag(tag)`.
- GraphQL per i singoli contenuti, REST (`fetchREST`) per le liste paginate e i post adiacenti: WPGraphQL non ha offset e il suo `dateQuery` ha precisione al giorno.
- Le immagini usano `mediaItemUrl` (originale su `/wp-content/uploads/`), non `sourceUrl` che passa dal CDN Jetpack `i0.wp.com`.
- Nuove pagine WordPress con layout speciale (Elementor, plugin): aggiungerle a `CUSTOM_PAGES` in `[...uri]/page.tsx` con una vista in `components/views/`.
- I testi che arrivano dal DB custom (libri, recensioni) passano da `cleanText`: contengono caratteri Windows-1252 ed entità HTML.
- Libri in home: tutti quelli con `visible = 1`, dal più vecchio. Le recensioni della vecchia home sono in `docs/reviews-from-live.json`, nel formato del caricamento JSON della pagina WordPress "Recensioni libri".
- Next 16: `params`/`searchParams` delle pagine sono `Promise` e vanno attesi.
- Mutazioni tramite server actions in `lib/actions.ts` che ritornano un risultato discriminato `{ ok: true, ... } | { ok: false, error }` con messaggi in italiano; i client component usano `useTransition`.
- HTML da WordPress reso con il componente `WPContent` (classe `.wp-content`, stili dei blocchi Gutenberg in `globals.css`).
- Tutti i testi sono in italiano, anche quelli che il tema originale mostrava in inglese (date "15 aprile 2023" con `formatThemeDate`, "Articolo precedente", "Commenti", "Rispondi"...): è una scelta voluta, non una differenza da correggere.
- Pagine WordPress dismesse: in `RETIRED_PAGES` di `lib/content.ts` (rispondono 404). Redirect permanenti in `redirects()` di `next.config.js`.
- **SEO**: ogni pagina usa `generateMetadata` con `fetchYoastHead` + `yoastToMetadata` (il titolo Yoast include già " - MyChicMirror": è `title.absolute`) e stampa `<JsonLd json={buildJsonLd(yoast)} />`. Gli URL di WordPress vengono riscritti su `SITE_URL` (`toPublicUrl`).
- Dati secondari di una pagina (recensioni, correlati, post adiacenti) vanno avvolti in `orFallback`: se WordPress non risponde la pagina esce senza quella parte invece di andare in errore.
- Il video in home è una copertina che carica YouTube solo al clic (`YouTubeFacade`): pesa 1 MB in meno e non contatta Google prima del clic.
- Banner cookie: `components/ui/CookieBanner.tsx` (iubenda, configurazione copiata dal plugin WP).
- Analytics: Google Analytics 4 (`components/ui/GoogleAnalytics.tsx`, attivo solo se c'è `NEXT_PUBLIC_GA_MEASUREMENT_ID`) con Google Consent Mode v2: consensi negati di default, aggiornati da iubenda (`googleConsentMode: true`). Nel layout l'ordine è: `GoogleConsentDefaults`, `CookieBanner`, `GoogleAnalytics`.
- Immagini remote con `next/image`: ogni nuovo host va aggiunto a `images.remotePatterns` in `next.config.js`.
- **Multilingua**: italiano sugli URL storici, inglese sotto `/en/`. `src/proxy.ts` riscrive su `/it/...` e fa l'autodetect (cookie `mcm_lang`, poi Accept-Language; senza header resta italiano). Testi dell'interfaccia in `lib/i18n.ts`: nei server component `getDict(lang)` + `localePath(lang, uri)`, nei client `useI18n()`. Ogni link interno passa da lì. Il selettore e "Read in English" sono `<a>` normali: `<Link>` farebbe il prefetch prima di salvare il cookie.
- **Articoli bilingui**: su WordPress restano "Italiano / English" con il testo diviso da `<hr>`; `localizePost` li separa. Tradotti: articoli, About e interfaccia. Privacy, Termini, Spedizione, trame dei libri e descrizioni prodotto restano in italiano (avviso sulle pagine, canonical sulla versione italiana, niente hreflang). Le pagine tradotte stanno in `sitemap.ts`.
- **Design = replica fedele del tema WordPress (Belletrist)**, tranne la pagina articolo, ridisegnata (`PostView`, `AudioPlayer`). Prima di implementare un componente, misurare gli stili calcolati sul sito live (font, misure, colori) e riprodurli.
- Token Tailwind del tema: colori `fake-black` (#6A5921, oro: voce attiva/hover e accenti), `nocciola` (#FAF2ED), `body-text` (#4D4D4D), `separator` (#9E9E9E), `mobile-header`, `mobile-menu`, `book-description`; font `font-cinzel` (titoli), `font-cormorant` (testo, default del body 19px/25px), `font-playfair` (corsivi, h6), `font-open-sans` (menu, bottoni).
- Breakpoint `desk` (≥1025px) = passaggio header mobile/desktop del tema. Classe `qodef-content-grid` (da `globals.css`) replica il contenitore del tema con le sue larghezze per breakpoint.
- Componenti base: `SectionTitle` (titolo Cinzel; centrato con lineetta o a sinistra con tagline, linea e testo), `Button` (bottone del tema, `filled`/`outlined`, link se riceve `href`).
- Con il plugin `@tailwindcss/aspect-ratio` le utility `aspect-video`/`aspect-square` non funzionano: usare `aspect-[16/9]` ecc.
- `trailingSlash: true`: tutti gli URL e i `href` interni finiscono con `/`, come su WordPress.
- Stile codice: tab nei file più vecchi, 2 spazi nei più recenti; Prettier in `.prettierrc`.

## Attenzione

- `.env` non è tracciato (contiene credenziali): le variabili sono documentate in `.env.example`.
- **Deploy**: Vercel, progetto collegato al repo GitHub (push su `main` → deploy, quindi in produzione). Go-live fatto il 06/11/2026: `www.mychicmirror.com` è su Vercel, `mychicmirror.com` fa redirect su `www`, WordPress e le sue API stanno su `cms.mychicmirror.com`. Staging: https://mychimirror-fe-three.vercel.app (sempre noindex). Finché `NEXT_PUBLIC_ALLOW_INDEXING` non è `"true"` ogni risposta ha `X-Robots-Tag: noindex` e `robots.txt` blocca tutto: si attiva solo al go-live sul dominio vero.
- **Cache**: le fetch verso WordPress durano 24h (`DEFAULT_REVALIDATE`) perché WordPress avvisa a ogni modifica via `/api/revalidate` (mu-plugin `mcm-frontend-sync.php`); libri e recensioni dal DB custom restano a 1h. **Se aggiungi un tag di cache nuovo, aggiungilo anche a `tagsFor` in `lib/revalidate.ts`**, altrimenti quel dato non si aggiorna fino a 24h.
- **mu-plugin da installare su WordPress** (`wordpress/mu-plugins/` → `wp-content/mu-plugins/`): `mcm-cart-handoff.php` (checkout), `mcm-store-api.php` (aggiunge peso e dimensioni alla Store API in `extensions.mcm`; senza, la scheda "Informazioni aggiuntive" non compare) `mcm-books.php` (pagina "Libri" del pannello: libri, sinossi dell'app nel campo `notes`, trama del sito in `plot` e store della tabella `shops`; usa la connessione di `mcm-reviews.php`), `mcm-reviews.php` (pagina "Recensioni libri" del pannello; richiede `MCM_REVIEWS_DB_NAME`, `MCM_REVIEWS_DB_USER`, `MCM_REVIEWS_DB_PASSWORD` in `wp-config.php`, perché i libri stanno in `Sql1291927_2` e non nel database di WordPress) e `mcm-frontend-sync.php` (revalidazione on-demand e link di anteprima; richiede le costanti `MCM_FRONTEND_URL`, `MCM_REVALIDATE_SECRET`, `MCM_PREVIEW_SECRET` in `wp-config.php`).
- Pagina prodotto: descrizione e descrizione breve vengono dalla REST di WordPress (`/wp/v2/product`) togliendo `<style>` e commenti, perché la Store API lascia il CSS come testo e rende visibili i commenti HTML. Le recensioni si leggono dalla Store API e si inviano a `wp-comments-post.php` (`submitProductReviewAction`).
- **Checkout**: `/checkout/` reindirizza a `NEXT_PUBLIC_WORDPRESS_SITE_URL/checkout/?mcm_cart=<Cart-Token>`. Il carrello viene ripreso solo se su WordPress è installato `wordpress/mu-plugins/mcm-cart-handoff.php` (in `wp-content/mu-plugins/`).
- Shop: i libri sono "Esauriti" su WooCommerce (si comprano dai link esterni nella descrizione); il fazzoletto è l'unico prodotto acquistabile ed è nascosto dal catalogo (`catalog_visibility: hidden`), quindi si raggiunge solo dalla sua pagina.
- Le immagini della Store API arrivano dal CDN Jetpack (`i0.wp.com`): `toProductImage` le riporta all'originale e legge le dimensioni dal parametro `fit`.
- Form contatti: l'invio vero usa reCAPTCHA v3 e funziona solo da un dominio autorizzato per la chiave (non da localhost).
- **WP REST Cache**: su WordPress c'è una cache delle risposte REST (header `x-wp-cached-call: served-cache`) che resta vecchia dopo un salvataggio: `fetchREST` e `lib/preview.ts` aggiungono `skip_cache=1`. Ogni nuova lettura REST deve fare lo stesso.
- **Rate limit Aruba**: il proxy di Aruba risponde 429 se riceve troppe richieste API dallo stesso IP (succede lanciando `check-urls.mjs` a freddo). Next non mette in cache le risposte non-200.
- `/wp-content/`, `/wp-json/`, `/wc-api/` e `/API/*.php` su `www` sono inoltrati a `cms` da `next.config.js`: l'app mobile li usa, non vanno rimossi. Il pannello WordPress è su `cms`.
- **Google Play (app Android MyChicMirror2)**: il link "eliminazione account" della sezione Sicurezza dei dati è `https://www.mychicmirror.com/elimina-account/` (`[lang]/elimina-account/page.tsx`, testi in `deleteAccount` di `lib/i18n.ts`). Deve restare raggiungibile, citare app e sviluppatore come nella scheda Play e mostrare subito come chiedere l'eliminazione. `/contact/` e `/delete-account/` vi fanno redirect.
