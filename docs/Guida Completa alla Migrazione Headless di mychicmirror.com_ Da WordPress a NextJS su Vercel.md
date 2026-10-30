# Guida completa alla migrazione headless di mychicmirror.com

Il passaggio da WordPress tradizionale a un'architettura headless con NextJS su Vercel richiede pianificazione meticolosa su 12 fronti tecnici distinti. WordPress si sposta su `cms.mychicmirror.com` come backend API, mentre NextJS serve il frontend dal dominio principale tramite Vercel. Questa guida fornisce configurazioni specifiche, codice implementabile e una timeline dettagliata per minimizzare downtime e preservare il posizionamento SEO.

---

## Architettura target e prerequisiti

L'architettura finale prevede una separazione netta tra contenuti e presentazione: WordPress con WooCommerce gestisce prodotti, ordini e contenuti su un sottodominio dedicato, mentre NextJS su Vercel renderizza l'interfaccia utente consumando dati via GraphQL.\[1\]\[2\]\[3\]

**Stack tecnologico richiesto:**
- WordPress 6.x con WPGraphQL e WPGraphQL for WooCommerce
- NextJS 14+ con App Router
- Vercel per hosting e CDN
- Let's Encrypt per SSL su entrambi i domini

**Plugin WordPress essenziali da installare:**
```bash
# Via Composer (raccomandato)
composer require wp-graphql/wp-graphql wp-graphql/wp-graphql-woocommerce

# Oppure manualmente dal repository WordPress
# 1. WPGraphQL (base GraphQL server)
# 2. WPGraphQL for WooCommerce (WooGraphQL)
# 3. WPGraphQL-CORS (gestione CORS)
# 4. WPGraphQL JWT Authentication (autenticazione)
```

---

## Configurazione WPGraphQL e WooCommerce

WPGraphQL espone l'intero contenuto WordPress tramite endpoint GraphQL, mentre WooGraphQL aggiunge query e mutation specifiche per e-commerce.\[1\]\[4\] La configurazione richiede attenzione particolare alla gestione sessioni cross-domain.

**Configurazione wp-config.php:**
```php
// Chiavi segrete per JWT e sessioni WooCommerce
define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'chiave-segreta-jwt-univoca-32-caratteri');
define('GRAPHQL_WOOCOMMERCE_SECRET_KEY', 'chiave-segreta-woocommerce-session');

// URL frontend per preview e redirect
define('NEXTJS_FRONTEND_URL', 'https://mychicmirror.com/');
define('NEXTJS_PREVIEW_SECRET', 'token-preview-sicuro');
define('NEXTJS_REVALIDATION_SECRET', 'token-revalidation-sicuro');

// Debug solo in sviluppo
define('GRAPHQL_DEBUG', false);
```

**Impostazioni WooGraphQL nel pannello admin:**
Navigare a `WPGraphQL → Settings → WooGraphQL` e abilitare:
- **QL Session Handler**: Utilizza JWT invece di cookie per sessioni cross-domain\[5\]
- **Enable Unsupported Product Type**: Se si usano tipi prodotto custom
- **Enable Session Transfer URLs**: Per handoff checkout a WordPress

### Query GraphQL per prodotti

**Query lista prodotti con paginazione:**
```graphql
query GetProducts($first: Int, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      databaseId
      slug
      name
      type
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
        onSale
        stockStatus
        stockQuantity
      }
      ... on VariableProduct {
        price
        regularPrice
        variations(first: 50) {
          nodes {
            id
            databaseId
            name
            price
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
```

**Query singolo prodotto con tutti i dettagli:**
```graphql
query GetProduct($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    id
    databaseId
    slug
    name
    description
    image {
      sourceUrl
      altText
    }
    galleryImages {
      nodes {
        sourceUrl(size: WOOCOMMERCE_THUMBNAIL)
        altText
      }
    }
    productCategories {
      nodes {
        name
        slug
      }
    }
    ... on SimpleProduct {
      price
      rawPrice: price(format: RAW)
      regularPrice
      salePrice
      stockStatus
      stockQuantity
    }
  }
}
```

---

## Configurazione CORS e autenticazione

La comunicazione cross-domain tra NextJS e WordPress richiede header CORS specifici. WPGraphQL-CORS semplifica la configurazione ma è possibile implementarla manualmente.

**Configurazione tramite plugin WPGraphQL-CORS:**
Nel pannello `GraphQL → Settings → CORS Settings`:
- ✅ Send site credentials
- ✅ Enable login mutation
- ✅ Enable logout mutation

In "Extend Access-Control-Allow-Origin header":
```
https://mychicmirror.com
http://localhost:3000
```
\[6\]

**Configurazione manuale via .htaccess:**
```apache
<IfModule mod_headers.c>
    SetEnvIf Origin "^https?://(localhost:3000|mychicmirror\.com)$" CORS_ORIGIN=$0
    Header always set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, woocommerce-session"
    Header always set Access-Control-Expose-Headers "woocommerce-session"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

### Apollo Client con gestione sessione WooCommerce

```typescript
// lib/apolloClient.ts
import { 
  ApolloClient, 
  InMemoryCache, 
  createHttpLink, 
  ApolloLink,
  from 
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const SESSION_TOKEN_KEY = 'woo-session';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

// Aggiunge token sessione alle richieste
const sessionLink = setContext((_, { headers }) => {
  const sessionToken = typeof window !== 'undefined' 
    ? localStorage.getItem(SESSION_TOKEN_KEY) 
    : null;
  
  return {
    headers: {
      ...headers,
      ...(sessionToken && { 
        'woocommerce-session': `Session ${sessionToken}` 
      }),
    },
  };
});

// Cattura token sessione dalle risposte
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();
    const sessionHeader = context.response?.headers?.get('woocommerce-session');
    
    if (sessionHeader && typeof window !== 'undefined') {
      const token = sessionHeader.replace('Session ', '');
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    
    return response;
  });
});

export const client = new ApolloClient({
  link: from([sessionLink, afterwareLink, httpLink]),
  cache: new InMemoryCache(),
});
```

---

## Implementazione carrello WooCommerce in NextJS

Il carrello WooCommerce in architettura headless utilizza sessioni JWT invece di cookie.\[7\] Le operazioni avvengono tramite mutation GraphQL che restituiscono sempre lo stato aggiornato del carrello.

**Mutation per aggiunta al carrello:**
```graphql
mutation AddToCart($productId: Int!, $quantity: Int = 1, $variationId: Int) {
  addToCart(input: {
    productId: $productId
    quantity: $quantity
    variationId: $variationId
  }) {
    cart {
      contents {
        itemCount
        nodes {
          key
          quantity
          total
          product {
            node {
              name
              slug
              image {
                sourceUrl
              }
            }
          }
        }
      }
      subtotal
      total
    }
  }
}
```

**React Hook per gestione carrello:**
```typescript
// hooks/useCart.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';

interface CartContextType {
  cart: any;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data, loading } = useQuery(GET_CART);
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [updateQuantitiesMutation] = useMutation(UPDATE_CART_QUANTITIES);
  const [removeItemMutation] = useMutation(REMOVE_CART_ITEM);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    if (data?.cart) setCart(data.cart);
  }, [data]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    const { data } = await addToCartMutation({
      variables: { productId, quantity },
    });
    if (data?.addToCart?.cart) setCart(data.addToCart.cart);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
```

### Checkout: strategia hosted consigliata

Per il checkout, la strategia più robusta è il **session handoff** a WordPress, che preserva tutti i gateway di pagamento esistenti:

```typescript
// utils/checkoutHandoff.ts
import jwtDecode from 'jwt-decode';

export function getCheckoutUrl(): string {
  const sessionToken = localStorage.getItem('woo-session');
  
  if (!sessionToken) {
    return `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/checkout/`;
  }
  
  const decoded = jwtDecode<{ data: { customer_id: string } }>(sessionToken);
  const customerId = decoded.data.customer_id;
  
  return `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/checkout/?session_id=${customerId}`;
}
```

**Plugin WordPress per caricare la sessione:**
```php
// Aggiungere in functions.php o plugin custom
add_action('woocommerce_load_cart_from_session', function() {
    if (!isset($_GET['session_id'])) return;

    $session_id = sanitize_text_field($_GET['session_id']);
    $handler = new WC_Session_Handler();
    $session_data = $handler->get_session($session_id);

    if (empty($session_data)) return;

    foreach ($session_data as $key => $value) {
        WC()->session->set($key, maybe_unserialize($value));
    }
});
```

---

## Configurazione DNS per la migrazione

La migrazione DNS richiede preparazione anticipata per minimizzare propagation time. Il TTL va abbassato **48 ore prima** del cutover per permettere rollback rapidi.\[8\]

**Timeline DNS:**

| Fase | Azione | TTL |
|------|--------|-----|
| T-48h | Abbassare TTL record esistenti | 60 secondi |
| T-24h | Configurare `cms.mychicmirror.com` | 60 secondi |
| T-0 | Switch dominio principale a Vercel | 60 secondi |
| T+72h | Aumentare TTL dopo stabilizzazione | 3600 secondi |

**Record DNS finali:**
```
; Dominio principale su Vercel
mychicmirror.com        A       76.76.21.21              TTL 60
www.mychicmirror.com    CNAME   cname.vercel-dns.com     TTL 60

; WordPress backend
cms.mychicmirror.com    A       [IP-Server-WordPress]    TTL 60

; CAA record per Let's Encrypt
mychicmirror.com        CAA     0 issue "letsencrypt.org"
```

---

## Certificati SSL per entrambi i domini

**Vercel (dominio principale):** SSL automatico tramite Let's Encrypt. Vercel gestisce provisioning e rinnovo senza intervento manuale. Requisiti:
- DNS correttamente configurato
- Path `/.well-known/acme-challenge/` accessibile
- CAA record che include `letsencrypt.org`

**WordPress subdomain:** Configurare con Certbot:
```bash
# Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d cms.mychicmirror.com

# Apache
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d cms.mychicmirror.com
```

**Configurazione Nginx per WordPress:**
```nginx
server {
    listen 443 ssl http2;
    server_name cms.mychicmirror.com;
    
    ssl_certificate /etc/letsencrypt/live/cms.mychicmirror.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.mychicmirror.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    root /var/www/cms.mychicmirror.com;
    
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

---

## Deployment NextJS su Vercel con ISR

L'Incremental Static Regeneration (ISR) è la strategia ottimale per contenuti WordPress: pagine pre-renderizzate con revalidazione on-demand quando i contenuti cambiano.\[1\]\[9\]

**next.config.js completo:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.mychicmirror.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 giorni
  },
  logging: {
    fetches: { fullUrl: true },
  },
};

module.exports = nextConfig;
```

**Variabili ambiente Vercel:**
```
NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://cms.mychicmirror.com/graphql
NEXTJS_PREVIEW_SECRET=token-preview-sicuro
NEXTJS_REVALIDATION_SECRET=token-revalidation-sicuro
```

### Data fetching con cache tags

```typescript
// lib/wordpress.ts
export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { tags?: string[]; revalidate?: number }
): Promise<T> {
  const { tags = ['wordpress'], revalidate = 3600 } = options || {};

  const response = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { tags, revalidate },
  });

  const json = await response.json();
  if (json.errors) throw new Error('GraphQL fetch failed');
  return json.data;
}
```

---

## Gestione immagini WordPress con next/image

Le immagini WordPress vengono ottimizzate automaticamente da Vercel Image Optimization. Configurare `remotePatterns` per autorizzare il dominio CMS.

**Componente immagine WordPress:**
```typescript
// components/WordPressImage.tsx
import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function WordPressImage({ src, alt, width, height, priority }: Props) {
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <Image
      src={src}
      alt={alt || ''}
      width={width || 800}
      height={height || 600}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
```

---

## Preview e bozze in NextJS

Il Draft Mode di NextJS permette di visualizzare contenuti non pubblicati direttamente dal pannello WordPress.\[10\]

**API Route per attivare preview:**
```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const postType = searchParams.get('post_type') || 'post';

  if (secret !== process.env.NEXTJS_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const redirectPath = postType === 'post' ? `/blog/${slug}` : `/${slug}`;
  redirect(redirectPath);
}
```

**Funzione WordPress per redirect preview:**
```php
add_filter('preview_post_link', function($preview_link, $post) {
    $frontend_url = NEXTJS_FRONTEND_URL;
    $secret = NEXTJS_PREVIEW_SECRET;
    $slug = $post->post_name ?: sanitize_title($post->post_title);
    
    return add_query_arg([
        'secret' => $secret,
        'slug' => $slug,
        'post_type' => $post->post_type,
    ], $frontend_url . 'api/preview');
}, 10, 2);
```

---

## Gestione SEO durante la migrazione

La preservazione SEO richiede redirect 301 per tutti gli URL modificati, sitemap dinamica, e implementazione corretta di meta tag e dati strutturati.\[11\]

**Redirect in next.config.js:**
```javascript
module.exports = {
  async redirects() {
    return [
      // URL WordPress con data
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // Categorie WooCommerce
      {
        source: '/product-category/:slug',
        destination: '/category/:slug',
        permanent: true,
      },
      // Shop page
      {
        source: '/shop/',
        destination: '/products',
        permanent: true,
      },
    ];
  },
};
```

**Sitemap dinamica:**
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();
  const products = await fetchAllProducts();
  
  const blogUrls = posts.map((post) => ({
    url: `https://mychicmirror.com/blog/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const productUrls = products.map((product) => ({
    url: `https://mychicmirror.com/product/${product.slug}`,
    lastModified: new Date(product.date_modified),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    { url: 'https://mychicmirror.com', priority: 1 },
    { url: 'https://mychicmirror.com/products', priority: 0.9 },
    ...blogUrls,
    ...productUrls,
  ];
}
```

**Schema.org per prodotti:**
```typescript
// components/ProductSchema.tsx
export function ProductSchema({ product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.src),
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: product.stock_status === 'instock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

## Webhook e sincronizzazione real-time

I webhook WordPress notificano NextJS quando i contenuti cambiano, triggerando revalidazione on-demand delle pagine interessate.\[12\]

**Configurazione webhook WooCommerce:**
In `WooCommerce → Settings → Advanced → Webhooks`:
- Topic: `Product updated`
- Delivery URL: `https://mychicmirror.com/api/revalidate`
- Secret: stessa chiave di `NEXTJS_REVALIDATION_SECRET`

**API Route per revalidazione:**
```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-wc-webhook-signature');
  const body = await request.text();
  
  // Verifica firma HMAC-SHA256
  const secret = process.env.NEXTJS_REVALIDATION_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(body).digest('base64');
  
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  
  // Revalida pagine basate sul tipo di contenuto
  if (payload.slug) {
    revalidatePath(`/product/${payload.slug}`);
    revalidateTag('products');
  }
  
  return NextResponse.json({ revalidated: true });
}
```

**Trigger revalidazione da WordPress (save_post):**
```php
add_action('save_post', function($post_id, $post) {
    if (wp_is_post_autosave($post_id) || $post->post_status !== 'publish') return;
    
    $frontend_url = NEXTJS_FRONTEND_URL;
    $secret = NEXTJS_REVALIDATION_SECRET;
    
    $paths = $post->post_type === 'post' 
        ? ["/blog/{$post->post_name}", '/blog'] 
        : ["/{$post->post_name}"];
    
    wp_remote_post($frontend_url . 'api/revalidate?secret=' . $secret, [
        'body' => json_encode(['paths' => $paths]),
        'headers' => ['Content-Type' => 'application/json'],
        'blocking' => false,
    ]);
}, 10, 2);
```

---

## Strategia di testing e rollback

### Checklist pre-migrazione

**Settimana -2:**
- [ ] Abbassare TTL DNS a 60 secondi
- [ ] Configurare `cms.mychicmirror.com` con SSL
- [ ] Testare WPGraphQL completamente
- [ ] Configurare webhook endpoints
- [ ] Deploy staging su dominio secondario

**Giorno -1:**
- [ ] Backup completo database
- [ ] Freeze contenuti (nessuna modifica)
- [ ] Test E2E completo su staging
- [ ] Preparare script rollback

### Test E2E con Playwright

```typescript
// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('flusso acquisto completo', async ({ page }) => {
  await page.goto('/products/prodotto-test');
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  
  await page.click('[data-testid="checkout-button"]');
  // Verifica redirect a WordPress checkout
  await expect(page).toHaveURL(/cms\.mychicmirror\.com\/checkout/);
});
```

### Piano rollback

**Se problemi critici dopo go-live:**
1. **DNS rollback immediato** (< 5 minuti): cambiare A record a IP WordPress originale
2. **Vercel instant rollback**: Dashboard → Deployments → Promote deployment precedente
3. **WordPress theme**: mantenere attivo durante transizione per fallback

```bash
# Script rollback DNS (da eseguire se necessario)
# Cambiare A record mychicmirror.com a [IP-WORDPRESS-ORIGINALE]
```

---

## Timeline migrazione consigliata

| Settimana | Attività |
|-----------|----------|
| -4 | Completare sviluppo NextJS, configurare staging |
| -3 | Test E2E, performance testing, security audit |
| -2 | Abbassare TTL, configurare subdomain WordPress |
| -1 | Freeze contenuti, backup finali, test webhook |
| 0 | **GO-LIVE**: deploy produzione, switch DNS, monitoraggio |
| +1 | Monitoraggio errori, fix bug critici, aumentare TTL |

### Checklist giorno migrazione

```markdown
## T-0 Go-Live Checklist

### Pre-Launch (T-4h)
- [ ] Backup database finale
- [ ] Screenshot sito attuale
- [ ] Team dev e support in standby

### Launch (T-0)
- [ ] Deploy build produzione su Vercel
- [ ] Aggiornare DNS records
- [ ] Monitorare propagazione DNS
- [ ] Abilitare webhook WooCommerce
- [ ] Test: homepage, prodotti, carrello, checkout

### Post-Launch (T+1h)
- [ ] Verificare SSL attivo
- [ ] Controllare error logs Vercel
- [ ] Test Google Analytics
- [ ] Verificare sitemap.xml accessibile
```

---

## Conclusione

Questa migrazione richiede coordinamento preciso tra **12 componenti tecnici interdipendenti**. I fattori critici di successo sono: configurazione CORS corretta per comunicazione cross-domain, gestione sessioni JWT per carrello WooCommerce, webhook per sincronizzazione contenuti, e strategia DNS con TTL bassi per rollback rapido.\[2\]

La timeline ottimale è **4-6 settimane** dalla completamento sviluppo al go-live, con una settimana di stabilizzazione post-migrazione.\[13\] Mantenere WordPress frontend attivo durante la transizione garantisce un piano B immediato in caso di problemi imprevisti.

L'architettura headless porta benefici significativi in termini di **performance** (ISR + CDN Vercel), **flessibilità frontend** (React/NextJS), e **scalabilità** (separazione concerns),\[14\]\[15\] giustificando pienamente la complessità della migrazione per un progetto e-commerce come mychicmirror.com.\[15\]

## Fonti

1. [Using Headless WordPress with Next.js and Vercel](https://vercel.com/guides/wordpress-with-vercel)
2. [Headless WooCommerce with Next.js: Architecture and Trade-Offs - Gift Wrapper Plus for WooCommerce](https://www.giftwrapper.app/headless-woocommerce-with-next-js-architecture-and-trade-offs/)
3. [Yoast SEO for headless WordPress: how to set up with GraphQL and Next.js - White Canvas](https://wcanvas.com/blog/yoast-seo-for-headless-wordpress-graphql-next-js/)
4. [How to Manage SEO in Headless WordPress with Yoast SEO and WPGraphQL on Space Jelly](https://spacejelly.dev/posts/how-to-manage-seo-in-headless-wordpress-with-yoast-seo-and-wpgraphql)
5. [WPGraphQL for WooCommerce Settings Guide | Docs | WooGraphQL](https://woographql.com/docs/settings)
6. [Headless WordPress Authentication with Native Cookies](https://developers.wpengine.com/blog/headless-wordpress-authentication-native-cookies)
7. [How to Migrate to Headless WooCommerce Without Breaking Your Store - Wooninjas - The WooCommerce Ninjas](https://wooninjas.com/headless-woocommerce-migration/)
8. [Migrating servers using DNS TTL for minimum downtime - Virendra's TechTalk](https://www.virendrachandak.com/techtalk/migrating-servers-using-dns-ttl-for-minimum-downtime/)
9. [On demand ISR - Vercel Examples](https://solutions-on-demand-isr.vercel.app/)
10. [Guides: Draft Mode | Next.js](https://nextjs.org/docs/app/guides/draft-mode)
11. [eCommerce Migration Checklist: Complete Guide to a Smooth Migration Process - Clickysoft](https://clickysoft.com/ecommerce-migration-checklist/)
12. [How to Automate Deployments on Content Change in WordPress with WP Webhooks and Netlify on Space Jelly](https://spacejelly.dev/posts/how-to-automate-deployments-on-content-change-in-wordpress-with-wp-webhooks-and-netlify)
13. [The Strategic Website Migration Checklist: Protecting Rankings and Revenue | Ten Speed](https://www.tenspeed.io/blog/strategic-website-migration-checklist)
14. [The Ultimate Guide to Next.js Apollo Client Integration](https://www.dhiwise.com/post/a-comprehensive-guide-to-nextjs-apollo-client-integration)
15. [Headless WooCommerce with Nextjs & React - Blaze Commerce](https://blazecommerce.io/blog/headless-woocommerce-with-next-js/)
