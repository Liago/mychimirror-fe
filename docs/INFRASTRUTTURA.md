# Scheda infrastruttura di mychicmirror.com

Come è configurato il sito dopo il go-live del 06/11/2026. Questo file è nel repository: qui vanno solo nomi e valori pubblici, **mai password, segreti o chiavi private**.

La storia del lavoro è in `PIANO-DI-LAVORO.md`, le convenzioni di sviluppo in `../CLAUDE.md`.

## Come è fatto il sito

| Parte | Dove sta | Indirizzo |
|---|---|---|
| Sito pubblico (Next.js) | Vercel, progetto `mychimirror-fe` | https://www.mychicmirror.com |
| Staging, sempre noindex | Vercel | https://mychimirror-fe-three.vercel.app |
| CMS WordPress, noindex | Aruba, hosting condiviso | https://cms.mychicmirror.com |
| Vecchio sito, tenuto per il rollback | Aruba, `89.46.106.56` | Non raggiungibile da `www` |
| Codice | GitHub, `Liago/mychimirror-fe` | Un push su `main` va in produzione |

`mychicmirror.com` reindirizza a `www` con un 308. Su `www`, `/wp-content/`, `/wp-json/`, `/wc-api/` e `/API/*.php` sono inoltrati a `cms` da `next.config.js`: i vecchi link e l'app mobile dipendono da questi inoltri. `/checkout/`, `/my-account/` e `/wp-admin/` portano a `cms`.

## Database su Aruba

Tutti su MySQL con host `89.46.111.80`, raggiungibile solo dall'interno di Aruba: da Vercel la connessione va in timeout.

| Database | Contenuto | Usato da |
|---|---|---|
| `Sql1291927_5` | WordPress attuale, prefisso `wp_` | `cms` |
| `Sql1291927_2` | Libri e recensioni, tabella `reviews` | `/API/*.php`, mu-plugin `mcm-reviews.php` |
| `Sql1291927_1` | WordPress del vecchio sito | Solo rollback, non riceve più aggiornamenti |

Backup: `Sql1291927_1` è stato salvato il 05/11/2026.

## DNS su Aruba

Nameserver: `dns.technorail.com`, `dns2.technorail.com`, `dns3.arubadns.net`, `dns4.arubadns.cz`.

Record del sito:

| Tipo | Nome | Valore | Note |
|---|---|---|---|
| A | `@` | `216.198.79.1` | Vercel |
| CNAME | `www` | `79f21e41444972cd.vercel-dns-017.com.` | Vercel |
| A | `cms` | `89.46.109.46` | WordPress |
| AAAA | `cms` | `2a00:6d40:4:1::c294:46` | WordPress |

`@` e `www` non devono avere record AAAA. Il TTL di `@` e `www` è a 5 minuti: va riportato a 1 ora quando il rollback non serve più.

Da non toccare: `MX` (`10 mx.mychicmirror.com.`), SPF (`v=spf1 include:_spf.aruba.it ~all`), `mail`, `smtp`, `imap`, `pop3`, `mx`, `webmail`, `ftp`, `localhost`.

Se Aruba mostra il valore giusto ma i nameserver rispondono con quello vecchio, elimina e ricrea il record. È successo al go-live con il record A di `@`.

Il certificato di `www` è gestito e rinnovato da Vercel. Quello di `cms` è di Aruba e scade a febbraio 2027.

## Vercel

Domini: `www.mychicmirror.com` su Production, `mychicmirror.com` con redirect 308 su `www`. Piano attuale: Hobby, da rivedere alla riapertura dello shop.

Le variabili `NEXT_PUBLIC_*` vanno create di tipo normale, non Sensitive, altrimenti non sono leggibili né modificabili. Dopo una modifica serve un nuovo deploy.

| Variabile | Valore |
|---|---|
| `NEXT_PUBLIC_WORDPRESS_API_URL` | `https://cms.mychicmirror.com/graphql` |
| `NEXT_PUBLIC_WORDPRESS_SITE_URL` | `https://cms.mychicmirror.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.mychicmirror.com` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ID di Google Analytics |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Chiave pubblica reCAPTCHA |
| `BOOKS_EDITED_DATA` | `https://cms.mychicmirror.com/API/getBooks.php` |
| `BOOKS_REVIEWS_DATA` | `https://cms.mychicmirror.com/API/getBookReviews.php` |
| `MAIN_IMAGE_COVER_URL` | Foto di copertina su `cms` |
| `REVALIDATE_SECRET` | Segreto, uguale a `MCM_REVALIDATE_SECRET` |
| `PREVIEW_SECRET` | Segreto, uguale a `MCM_PREVIEW_SECRET` |
| `WP_PREVIEW_USER` | Utente WordPress per leggere le bozze |
| `WP_PREVIEW_APP_PASSWORD` | Application Password di quell'utente |

Non servono più: `DB_*`, `ADMIN_UPLOAD_PASSWORD`, `REVIEWS_API_SECRET`.

## WordPress su `cms`

Mu-plugin, da `wordpress/mu-plugins/` a `wp-content/mu-plugins/`:

| File | Funzione |
|---|---|
| `mcm-frontend-sync.php` | Avvisa il sito delle modifiche, apre le anteprime, noindex su `cms` |
| `mcm-cart-handoff.php` | Riprende il carrello al checkout |
| `mcm-store-api.php` | Aggiunge peso e dimensioni ai prodotti |
| `mcm-reviews.php` | Pagina "Recensioni libri" del pannello |

Costanti in `wp-config.php`, oltre a quelle di WordPress:

| Costante | Valore |
|---|---|
| `WP_HOME`, `WP_SITEURL` | `https://cms.mychicmirror.com` |
| `MCM_FRONTEND_URL` | `https://www.mychicmirror.com` |
| `MCM_REVALIDATE_SECRET` | Segreto, uguale a `REVALIDATE_SECRET` |
| `MCM_PREVIEW_SECRET` | Segreto, uguale a `PREVIEW_SECRET` |
| `MCM_REVIEWS_DB_NAME` | `Sql1291927_2` |
| `MCM_REVIEWS_DB_USER`, `MCM_REVIEWS_DB_PASSWORD` | Stesse credenziali dei file in `/API/` |
| `MCM_REVIEWS_DB_HOST` | Facoltativa: serve solo se l'host è diverso da `DB_HOST` |

Altre configurazioni:

- Il modulo contatti è Contact Form 7 con ID `43618`, impostato in `src/app/lib/actions.ts`.
- Jetpack è in Safe Mode su `cms`. Non premere "Move your settings", che sposterebbe il collegamento dal vecchio sito.
- La chiave reCAPTCHA funziona solo sui domini autorizzati, quindi il form non si invia da localhost.
- I plugin non più usati vanno tolti a passi durante F8.

## Operazioni ricorrenti

| Cosa fare | Come | Quando si vede sul sito |
|---|---|---|
| Articoli, pagine, prodotti | Pannello di `cms` | Subito |
| Recensioni dei libri | `cms` → Recensioni libri, con form, file JSON, modifica ed eliminazione | Subito |
| Copertine dei libri | phpMyAdmin, `Sql1291927_2`, tabella libri, campo `coverArt` (la home usa questo) | Entro 1 ora |
| Testi di home e rassegna stampa | Codice, `src/app/lib/editorial.ts` | Dopo il deploy |
| Controllo degli URL | `node scripts/check-urls.mjs https://www.mychicmirror.com` (`--en` per l'inglese) | Non cambia nulla |

Se un dato resta vecchio, attendi la scadenza: 1 ora per libri e recensioni, 24 ore per il resto. Lo svuotamento della Data Cache di Vercel è l'ultima risorsa: rilegge tutto da WordPress e Aruba può rispondere 429.

## Rollback

Serve finché il vecchio sito resta intatto. Su Aruba:

1. Elimina il CNAME di `www`.
2. Riporta `@` e `www` su A `89.46.106.56` e AAAA `2a00:6d40:4:3::c244:56`.

Ciò che è stato scritto su `cms` dopo il 06/11/2026, compresi commenti e ordini, va riportato a mano.

## Ancora da fare

- Riportare il TTL di `@` e `www` a 1 ora.
- Controllare Search Console e i 404 nelle prime settimane.
- Togliere i plugin WordPress inutilizzati, solo su `cms`.
- Sistemare Jetpack, le description Yoast di home e shop, il blocco preventivo di reCAPTCHA e il limite API di Aruba.
- Alla riapertura dello shop: prova d'acquisto reale, costo di spedizione (pagina 6,00 €, checkout 3,00 €), disponibilità del fazzoletto e piano Vercel.
- "Se me l'avessero detto": i link d'acquisto sono dentro un commento e puntano a "Pensami nuvola".
