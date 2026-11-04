<?php
/**
 * Plugin Name: MyChicMirror – sincronizzazione con il frontend Next.js
 * Description: Avvisa il frontend quando cambiano contenuti (revalidazione on-demand) e fa aprire le anteprime dell'editor sul frontend.
 * Version: 1.1.0
 *
 * Installazione: copiare questo file in wp-content/mu-plugins/ e aggiungere in wp-config.php:
 *
 *   define( 'MCM_FRONTEND_URL', 'https://www.mychicmirror.com' ); // senza "/" finale
 *   define( 'MCM_REVALIDATE_SECRET', '...' ); // = REVALIDATE_SECRET su Vercel
 *   define( 'MCM_PREVIEW_SECRET', '...' );    // = PREVIEW_SECRET su Vercel
 *
 * Senza queste costanti il plugin non fa nulla.
 */

defined( 'ABSPATH' ) || exit;

function mcm_sync_enabled(): bool {
	return defined( 'MCM_FRONTEND_URL' ) && defined( 'MCM_REVALIDATE_SECRET' ) && MCM_FRONTEND_URL && MCM_REVALIDATE_SECRET;
}

/** Percorso relativo di un URL WordPress, es. "/il-poeta-the-poet/". */
function mcm_sync_path( string $url ): string {
	return (string) wp_make_link_relative( $url );
}

/**
 * Accoda un evento: gli eventi di una richiesta vengono spediti tutti insieme
 * alla fine (un salvataggio scatena più hook).
 */
function mcm_sync_queue( array $event ): void {
	if ( ! mcm_sync_enabled() ) {
		return;
	}
	$GLOBALS['mcm_sync_events'][ md5( wp_json_encode( $event ) ) ] = $event;
}

add_action(
	'shutdown',
	function () {
		if ( empty( $GLOBALS['mcm_sync_events'] ) ) {
			return;
		}
		wp_remote_post(
			rtrim( MCM_FRONTEND_URL, '/' ) . '/api/revalidate/',
			array(
				'headers'  => array(
					'Content-Type' => 'application/json',
					'x-mcm-secret' => MCM_REVALIDATE_SECRET,
				),
				'body'     => wp_json_encode( array_values( $GLOBALS['mcm_sync_events'] ) ),
				'timeout'  => 3,
				'blocking' => false,
			)
		);
	}
);

/** Evento per un post, una pagina o un prodotto. */
function mcm_sync_post_event( WP_Post $post ): ?array {
	switch ( $post->post_type ) {
		case 'post':
		case 'page':
			// Per i contenuti cestinati il permalink ha il suffisso "__trashed"
			$url = str_replace( '__trashed', '', (string) get_permalink( $post ) );
			return array( 'type' => $post->post_type, 'uri' => mcm_sync_path( $url ) );
		case 'product':
			return array( 'type' => 'product', 'slug' => str_replace( '__trashed', '', $post->post_name ), 'id' => $post->ID );
	}
	return null;
}

// Pubblicazione, modifica, ritiro o cestinamento di contenuti pubblici
add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
			return;
		}
		if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return;
		}
		$event = mcm_sync_post_event( $post );
		if ( $event ) {
			mcm_sync_queue( $event );
		}
	},
	10,
	3
);

// Categorie, tag e categorie prodotto
foreach ( array( 'created_term', 'edited_term', 'delete_term' ) as $mcm_hook ) {
	add_action(
		$mcm_hook,
		function ( $term_id, $tt_id, $taxonomy ) {
			if ( ! in_array( $taxonomy, array( 'category', 'post_tag', 'product_cat' ), true ) ) {
				return;
			}
			$link = get_term_link( (int) $term_id, $taxonomy );
			mcm_sync_queue(
				array(
					'type'     => 'term',
					'taxonomy' => $taxonomy,
					'uri'      => is_wp_error( $link ) ? '' : mcm_sync_path( $link ),
				)
			);
		},
		10,
		3
	);
}

// Menu di navigazione
add_action(
	'wp_update_nav_menu',
	function () {
		mcm_sync_queue( array( 'type' => 'menu' ) );
	}
);

/** Evento per un commento (articolo) o una recensione (prodotto). */
function mcm_sync_comment_event( $comment ): void {
	$comment = get_comment( $comment );
	$post    = $comment ? get_post( $comment->comment_post_ID ) : null;
	if ( ! $post || 'publish' !== $post->post_status ) {
		return;
	}
	if ( 'product' === $post->post_type ) {
		mcm_sync_queue( array( 'type' => 'product_review', 'slug' => $post->post_name, 'id' => $post->ID ) );
	} else {
		mcm_sync_queue( array( 'type' => 'comment', 'uri' => mcm_sync_path( (string) get_permalink( $post ) ) ) );
	}
}

// Commento approvato subito, oppure approvato/rimosso dalla moderazione
add_action(
	'wp_insert_comment',
	function ( $id, $comment ) {
		if ( '1' === (string) $comment->comment_approved ) {
			mcm_sync_comment_event( $comment );
		}
	},
	10,
	2
);
add_action(
	'transition_comment_status',
	function ( $new_status, $old_status, $comment ) {
		if ( 'approved' === $new_status || 'approved' === $old_status ) {
			mcm_sync_comment_event( $comment );
		}
	},
	10,
	3
);

// Magazzino: dopo un ordine cambiano disponibilità e quantità massime
foreach ( array( 'woocommerce_product_set_stock', 'woocommerce_product_set_stock_status' ) as $mcm_hook ) {
	add_action(
		$mcm_hook,
		function ( $product_or_id ) {
			$product = is_numeric( $product_or_id ) ? wc_get_product( $product_or_id ) : $product_or_id;
			if ( $product instanceof WC_Product ) {
				mcm_sync_queue( array( 'type' => 'product', 'slug' => $product->get_slug(), 'id' => $product->get_id() ) );
			}
		}
	);
}

/** URL dell'anteprima sul frontend, o null se questo contenuto non ce l'ha. */
function mcm_sync_preview_url( WP_Post $post ): ?string {
	if ( ! defined( 'MCM_FRONTEND_URL' ) || ! defined( 'MCM_PREVIEW_SECRET' ) ) {
		return null;
	}
	if ( ! in_array( $post->post_type, array( 'post', 'page' ), true ) ) {
		return null;
	}
	return add_query_arg(
		array(
			'secret' => MCM_PREVIEW_SECRET,
			'type'   => $post->post_type,
			'id'     => $post->ID,
		),
		rtrim( MCM_FRONTEND_URL, '/' ) . '/api/preview/'
	);
}

// Il pulsante "Anteprima" dell'editor apre l'anteprima sul frontend
add_filter(
	'preview_post_link',
	function ( $link, $post ) {
		return mcm_sync_preview_url( $post ) ?? $link;
	},
	10,
	2
);

// Per le bozze l'editor a blocchi ignora il filtro qui sopra e apre
// /?p=<id>&preview=true: da lì reindirizziamo chi può modificare il contenuto
add_action(
	'template_redirect',
	function () {
		if ( ! is_preview() ) {
			return;
		}
		$post = get_queried_object();
		if ( ! $post instanceof WP_Post || ! current_user_can( 'edit_post', $post->ID ) ) {
			return;
		}
		$url = mcm_sync_preview_url( $post );
		if ( $url ) {
			// wp_redirect e non wp_safe_redirect: il frontend è su un altro dominio
			wp_redirect( $url );
			exit;
		}
	},
	1
);
