# Piano di lavoro — mychicmirror.com headless

Stato al 30/10/2026. Riferimento tecnico: `Guida Completa alla Migrazione Headless…md` (stessa cartella).

## Decisioni prese (30/10/2026)
- **Shop:** carrello headless con la Store API, checkout su WordPress (`cms.`)
- **Design:** replica fedele del tema attuale (Belletrist)
- **Next.js:** si aggiorna subito all'ultima versione stabile e NextUI viene sostituito
- **Infrastruttura:** hosting condiviso Aruba, DNS gestito da Aruba

## Punto di partenza

**Già fatto nel repo:** home (cover, ultimi 3 post, press, interviste YouTube, libri + recensioni), articolo singolo con commenti annidati e invio commenti, navigazione prev/next, tool admin per caricare recensioni.

**Mancante:** header/menu e footer completi, lista blog, categorie/tag, pagine (About, Contatti, Pillole, Racconti di Fragola + capitoli, Libri, Spedizione, Termini, Privacy, Tematiche), shop/prodotto/carrello/checkout, SEO (metadata, sitemap, redirect), 404, preview, revalidazione, deploy.

**Cosa ho trovato sul sito live** (cambia alcune scelte della guida):

| Guida | Realtà | Conseguenza |
|---|---|---|
| WooGraphQL + JWT per il carrello | WooGraphQL non installato; la WooCommerce **Store API** (`/wp-json/wc/store/v1`) è già attiva. Lo shop ha 7 prodotti semplici. | Uso Store API (header `Cart-Token`) e checkout ospitato su WP. Niente plugin nuovi da installare. |
| Post sotto `/blog/:slug` | I post sono alla radice: `/<slug>/` | Una route catch-all risolve qualsiasi URI tramite `nodeByUri` di WPGraphQL. Così gli URL restano identici e non servono redirect. Il `/posts/[slug]` di oggi diventa un redirect. |
| Server con nginx + certbot | Hosting condiviso Aruba | Sottodominio `cms.` e SSL si configurano dal pannello Aruba |
| Metadata SEO via GraphQL | Yoast c'è, ma senza l'add-on WPGraphQL | Installo "WPGraphQL for Yoast SEO" oppure leggo `yoast_head_json` via REST |
| — | Le immagini sono su `www…/wp-content/uploads`, gli endpoint custom su `www…/API/*.php` | Rewrite su Vercel di `/wp-content/*` e `/API/*` verso `cms.`: i vecchi URL nei contenuti continuano a funzionare |
| — | Molte pagine sono costruite con Elementor | Pagine "di design" (Home, About, Libri, Shop) rifatte in React; pagine di solo testo (Privacy, Termini, Spedizione, capitoli) rese dall'HTML di WP |

## Fasi

### F0 — Fondamenta ✅ (30/10/2026, tranne Vercel)
- Mettere in sicurezza `.env` (è tracciato in git): `git rm --cached .env`, aggiungere `.env.example`
- Aggiornare Next.js 14 → 16.4 + React 19; NextUI sostituito con Tailwind puro; rimossi Apollo, Sass, lodash e dipendenze inutilizzate; ESLint 9 flat config
- Layer dati unico `fetchGraphQL` con `fetch` nativo + cache tags (sostituisce Apollo lato server)
- ✅ Progetto Vercel collegato al repo GitHub (02/11/2026): staging su https://mychimirror-fe-three.vercel.app, non indicizzabile finché `NEXT_PUBLIC_ALLOW_INDEXING` non è `true`

### F1 — Layout e design system ✅ (30/10/2026, mini-cart rimandato a F3)
- Header con menu da WP (`MAIN_NAVIGATION`), menu mobile, footer, mini-cart
- Token tipografici e colori, componenti base (Container, Section title, Button, Card)
- Pagina 404 e stati di errore/caricamento

### F2 — Contenuti ✅ (completata il 02/11/2026 con la home)
- Catch-all `[...uri]` → post / pagina / categoria / tag
- Lista blog `/blog/` paginata, archivi categoria/tag
- Pagine Elementor rifatte: About, Contatti (form → REST di Contact Form 7), Pillole/Pillole emotive, I libri, I racconti di Fragola + capitoli, Tematiche, Press (portfolio-item)
- Pagine testuali: Privacy, Termini, Spedizione
- Rifinitura di Home e articolo esistenti (immagini `next/image`, HTML WP sanificato)

### F3 — Shop ✅ (02/11/2026, mu-plugin installati e passaggio al checkout verificato sul live)
- `/shop/`, `/product/<slug>/`, `/product-category/<slug>/` (stessi URL di oggi)
- Carrello con Store API: aggiungi, modifica quantità, rimuovi; contatore nell'header
- Checkout: passaggio al checkout di WordPress su `cms.` (gateway di pagamento invariati); `/cart/`, `/checkout/` e `/my-account/` rimandano a WP

### F4 — SEO e tracking ✅ (GA4 attivo e verificato con il consenso iubenda)
- `generateMetadata` dai dati Yoast; Open Graph; JSON-LD (Article, Product, Book)
- `sitemap.xml`, `robots.txt`, canonical, redirect dei vecchi URL non più usati
- Banner cookie iubenda, analytics (da decidere: Vercel Analytics / GA4)

### F5 — Integrazione CMS ✅ (02/11/2026; da attivare con mu-plugin, costanti in wp-config e variabili su Vercel)
- `/api/revalidate` chiamato da WP (`save_post`, webhook prodotti) → revalidazione on-demand
- Draft Mode per le anteprime dall'editor WP

### F6 — Staging e verifica
Fatto:
- ✅ Staging su Vercel che legge dal WP attuale; `scripts/check-urls.mjs`: tutte le 331 URL delle sitemap ok, senza blocchi di Aruba sulle chiamate da Vercel
- ✅ Lighthouse mobile su build locale di produzione (home 74, shop 86, prodotto 90, articolo 91; live: 43, 60, 56, 75). Da rimisurare su Vercel dopo il deploy
- ✅ Video YouTube caricato solo al clic, header di sicurezza, 0 vulnerabilità nelle dipendenze di produzione, nessuna credenziale nella storia di git
- ✅ URL fuori dalle sitemap: archivi per data, autore e `/page/N/` portano al blog; `/feed/` RSS; shortlink `?p=` e `?page_id=`

Da fare prima del go-live:
- Prova d'acquisto completa con ordine reale a importo minimo, poi rimborso
- Invio reale del form contatti dallo staging
- Caricare `docs/reviews-from-live.json` da `/admin/reviews-upload`
- Decidere il blocco preventivo di reCAPTCHA (il video ora parte solo al clic)
- Contenuti WordPress: link ai capitoli dismessi in `/i-racconti-di-fragola/` e `/i_racconti_di_fragola/`, description di home e shop in Yoast, costo di spedizione (pagina 6,00€, checkout 3,00€)
- ⚠️ Il proxy di Aruba può rispondere 429 a raffiche di chiamate dallo stesso IP: chiedere ad Aruba il limite esatto e se si possono escludere gli IP di Vercel

### F7 — Migrazione infrastruttura e go-live (≈1 settimana di calendario, poche ore di lavoro)
- T-7: creare `cms.mychicmirror.com` su Aruba con SSL; abbassare il TTL DNS
- T-1: freeze contenuti, backup completo (DB + file)
- Prima del T-0, in `next.config.js`: rewrite di `/wp-content/*` e `/API/*` verso `cms.` (i contenuti hanno immagini con URL assoluti su `www`), redirect di `/wp-admin/` e `/wp-login.php` a `cms.`, `cms.` in `remotePatterns`
- T-0: spostare `home`/`siteurl` di WP su `cms.`, aggiornare CORS e cookie, puntare `www` e apex a Vercel, smoke test
- T-0, variabili Vercel: `NEXT_PUBLIC_WORDPRESS_API_URL` e `NEXT_PUBLIC_WORDPRESS_SITE_URL` su `cms.`, `BOOKS_*` e `MAIN_IMAGE_COVER_URL` su `cms.`, `NEXT_PUBLIC_ALLOW_INDEXING=true`; nuovi `REVALIDATE_SECRET` e `PREVIEW_SECRET`
- T-0, `wp-config.php`: `MCM_FRONTEND_URL` su `https://www.mychicmirror.com` e i nuovi segreti
- T-0, Search Console: inviare `sitemap.xml`
- Rollback: DNS di nuovo su Aruba + `siteurl` ripristinato (< 15 min)

### F8 — Post go-live (1-2 settimane)
- Monitoraggio 404 ed errori, Search Console, Core Web Vitals; TTL di nuovo alti; dismissione tema Belletrist/Elementor

**Totale stimato:** circa 4-5 settimane di sviluppo, più la finestra di go-live.

## Rischi principali
1. **MySQL Aruba da Vercel:** l'hosting condiviso di solito non accetta connessioni MySQL dall'esterno, quindi il tool `/admin/reviews-upload` su Vercel potrebbe non funzionare. Alternativa: un endpoint PHP su `cms.` che riceve le recensioni.
2. **Cambio dominio di WP:** spostare `siteurl` su `cms.` cambia gli URL dei media e i cookie di WooCommerce. Va provato prima su una copia (staging WP).
3. **Contenuti Elementor:** l'HTML delle pagine Elementor senza i CSS di Elementor appare rotto, per questo quelle pagine si rifanno in React.
