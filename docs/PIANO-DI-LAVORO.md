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
- ✅ Lighthouse mobile sullo staging Vercel con cache calda: home 88, shop 92, prodotto 88, articolo 96 (live: 43, 60, 56, 75); LCP 2,5–3,7 s, CLS 0
- ✅ Video YouTube caricato solo al clic, header di sicurezza, 0 vulnerabilità nelle dipendenze di produzione, nessuna credenziale nella storia di git
- ✅ URL fuori dalle sitemap: archivi per data, autore e `/page/N/` portano al blog; `/feed/` RSS; shortlink `?p=` e `?page_id=`

Da fare prima del go-live:
- Prova d'acquisto completa con ordine reale a importo minimo, poi rimborso
- Invio reale del form contatti dallo staging
- Caricare `docs/reviews-from-live.json` da `/admin/reviews-upload`
- Decidere il blocco preventivo di reCAPTCHA (il video ora parte solo al clic)
- Contenuti WordPress: link ai capitoli dismessi in `/i-racconti-di-fragola/` e `/i_racconti_di_fragola/`, description di home e shop in Yoast, costo di spedizione (pagina 6,00€, checkout 3,00€)
- ⚠️ Il proxy di Aruba può rispondere 429 a raffiche di chiamate dallo stesso IP: chiedere ad Aruba il limite esatto e se si possono escludere gli IP di Vercel

### Revamp pre go-live ✅ (04/11/2026)
- Sito IT/EN: italiano sugli URL storici, inglese sotto `/en/`, autodetect, selettore nell'header, hreflang e sitemap
- Pagina articolo ridisegnata: foto e titolo affiancati, nuovo player audio, una lingua per volta
- Dopo il deploy: rilanciare `check-urls.mjs` sullo staging

### F7 — Migrazione infrastruttura e go-live
Decisione (05/11/2026): `cms.mychicmirror.com` esiste già ed è una copia separata di WordPress, ferma a ottobre 2025, con SSL attivo. Si aggiorna quella copia e il WordPress su `www` resta intatto: il rollback è solo DNS e si può provare tutto prima di toccare il dominio.

1. **Backup e copia su `cms`:** backup completo di `www`; export del database con phpMyAdmin e import nel database di `cms`; copia via FTP di `wp-content` e `/API/`. Niente plugin di migrazione: sostituirebbero `www` con `cms` anche nei link interni dei contenuti.
2. **Configurazione di `cms`:** `WP_HOME` e `WP_SITEURL` in `wp-config.php`, credenziali DB di `cms` anche in `/API/`, costanti `MCM_*`, chiave reCAPTCHA autorizzata per il dominio.
3. **Prove con lo staging su `cms`:** variabili Vercel `NEXT_PUBLIC_WORDPRESS_API_URL`, `NEXT_PUBLIC_WORDPRESS_SITE_URL`, `BOOKS_*`, `MAIN_IMAGE_COVER_URL`, `DB_*`; controllo URL, anteprima, revalidazione, form, checkout completo, callback dei pagamenti.
4. **Preparazione (✅ fatta o da fare prima del T-0):** contenuti da correggere su `cms`, non su `www`, che non verrà più copiato (link ai capitoli, description Yoast), TTL DNS a 300 secondi, `www` e apex aggiunti su Vercel senza toccare i DNS.
5. **T-0, in quest'ordine:**
   1. Nessuna nuova copia: `www` e `cms` sono allineati (verificato il 6 novembre 2026: stessi conteggi di articoli, pagine, prodotti, media e commenti). Da qui niente modifiche su `www`; backup del database `Sql1291927_1` per il rollback.
   2. Verifica finale: se nel frattempo su `www` è arrivato un commento o un ordine, si riporta a mano su `cms`.
   3. Nuovi segreti `REVALIDATE_SECRET` e `PREVIEW_SECRET`: su Vercel e nel `wp-config.php` di `cms`, con `MCM_FRONTEND_URL` su `https://www.mychicmirror.com`.
   4. Vercel: `NEXT_PUBLIC_SITE_URL=https://www.mychicmirror.com`, `NEXT_PUBLIC_ALLOW_INDEXING=true`, redeploy senza build cache.
   5. DNS su Aruba: `@` record A `216.198.79.1`, senza AAAA; `www` senza A né AAAA, con CNAME `79f21e41444972cd.vercel-dns-017.com.`. `cms`, `mx`, `mail`, `smtp`, `imap`, `ftp`, `webmail`, gli MX e l'SPF non si toccano.
   6. Controlli: certificato SSL, `robots.txt`, `check-urls.mjs`, redirect di `mychicmirror.com` su `www`, form, revalidazione, anteprima, app mobile (`/API/*.php`, `/wp-json/`).
   7. Search Console: sitemap `https://www.mychicmirror.com/sitemap.xml`.
6. **Dopo il T-0:** caricare `docs/reviews-from-live.json` da `/admin/reviews-upload` (va su `cms`; se MySQL rifiuta le connessioni da Vercel serve un endpoint PHP), Jetpack.
7. **Rollback:** tolto il CNAME di `www`, record `@` e `www` di nuovo su `89.46.106.56` e AAAA su `2a00:6d40:4:3::c244:56`. Il WordPress di `www` riparte com'era; ciò che è stato scritto su `cms` dopo il T-0 va riportato a mano.

Le app mobile usano `www/API/*.php` e `www/wp-json/`: con il dominio su Vercel passano dagli inoltri verso `cms`, quindi tutti i file di `/API/` devono usare il database di `cms`.

Con `NEXT_PUBLIC_WORDPRESS_SITE_URL` su `cms.`, `next.config.js` riscrive `/wp-content/*`, `/wp-json/*`, `/wc-api/*` e `/API/*` verso `cms.` e reindirizza `/wp-admin/` e `/wp-login.php`.

### F8 — Post go-live (1-2 settimane)
- Monitoraggio 404 ed errori, Search Console, Core Web Vitals; TTL di nuovo alti; dismissione tema Belletrist/Elementor

**Totale stimato:** circa 4-5 settimane di sviluppo, più la finestra di go-live.

## Rischi principali
1. **MySQL Aruba da Vercel:** l'hosting condiviso di solito non accetta connessioni MySQL dall'esterno, quindi il tool `/admin/reviews-upload` su Vercel potrebbe non funzionare. Alternativa: un endpoint PHP su `cms.` che riceve le recensioni.
2. **Cambio dominio di WP:** su `cms.` cambiano gli URL dei media e i cookie di WooCommerce: si prova sulla copia prima del cambio DNS.
3. **Contenuti Elementor:** l'HTML delle pagine Elementor senza i CSS di Elementor appare rotto, per questo quelle pagine si rifanno in React.
