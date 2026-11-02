<?php
/**
 * Plugin Name: MyChicMirror – passaggio del carrello al checkout
 * Description: Riprende nel checkout di WooCommerce il carrello creato dal frontend Next.js tramite la Store API (Cart-Token).
 * Version: 1.0.0
 *
 * Installazione: copiare questo file in wp-content/mu-plugins/ (si attiva da solo).
 *
 * Il frontend manda l'utente su /checkout/?mcm_cart=<Cart-Token>. Il token è
 * firmato da WooCommerce: lo verifichiamo, copiamo i dati della sessione Store API
 * (carrello, indirizzi, spedizione) nella sessione del browser e ripuliamo l'URL.
 */

defined( 'ABSPATH' ) || exit;

const MCM_CART_PARAM = 'mcm_cart';

/**
 * Restituisce la chiave di sessione contenuta in un Cart-Token valido, o null.
 */
function mcm_cart_session_key_from_token( string $token ): ?string {
	$utils = '\Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils';
	if ( ! class_exists( $utils ) || ! $utils::validate_cart_token( $token ) ) {
		return null;
	}
	$payload = $utils::get_cart_token_payload( $token );
	return isset( $payload['user_id'] ) ? (string) $payload['user_id'] : null;
}

// Prima che WooCommerce legga il carrello dalla sessione, copiamo i dati della sessione Store API
add_action(
	'woocommerce_load_cart_from_session',
	function () {
		if ( empty( $_GET[ MCM_CART_PARAM ] ) || ! WC()->session ) {
			return;
		}

		$token = sanitize_text_field( wp_unslash( $_GET[ MCM_CART_PARAM ] ) );

		// Una sola copia per token: se l'utente ricarica la pagina non sovrascriviamo le modifiche fatte al checkout
		$marker = wp_hash( $token );
		if ( WC()->session->get( 'mcm_cart_handoff' ) === $marker ) {
			return;
		}

		$session_key = mcm_cart_session_key_from_token( $token );
		if ( ! $session_key ) {
			return;
		}

		$data = WC()->session->get_session( $session_key );
		if ( empty( $data ) || ! is_array( $data ) ) {
			return;
		}

		foreach ( $data as $key => $value ) {
			WC()->session->set( $key, maybe_unserialize( $value ) );
		}
		WC()->session->set( 'mcm_cart_handoff', $marker );
		WC()->session->set_customer_session_cookie( true );
	},
	1
);

// Togliamo il token dall'URL dopo averlo usato
add_action(
	'template_redirect',
	function () {
		if ( empty( $_GET[ MCM_CART_PARAM ] ) ) {
			return;
		}
		wp_safe_redirect( remove_query_arg( MCM_CART_PARAM ) );
		exit;
	}
);
