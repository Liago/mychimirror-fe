<?php
/**
 * Plugin Name: MyChicMirror – dati extra nella Store API
 * Description: Aggiunge peso e dimensioni dei prodotti alla Store API di WooCommerce (extensions.mcm), per la scheda "Informazioni aggiuntive" del frontend Next.js.
 * Version: 1.0.0
 *
 * Installazione: copiare questo file in wp-content/mu-plugins/ (si attiva da solo).
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'woocommerce_blocks_loaded',
	function () {
		if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) ) {
			return;
		}

		woocommerce_store_api_register_endpoint_data(
			array(
				'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema::IDENTIFIER,
				'namespace'       => 'mcm',
				'schema_type'     => ARRAY_A,
				// Stessi valori e formato della tabella "Informazioni aggiuntive" del tema
				'data_callback'   => function ( $product ) {
					return array(
						'weight'     => $product->has_weight() ? wc_format_weight( $product->get_weight() ) : '',
						'dimensions' => $product->has_dimensions() ? wc_format_dimensions( $product->get_dimensions( false ) ) : '',
					);
				},
				'schema_callback' => function () {
					return array(
						'weight'     => array(
							'description' => 'Peso formattato (es. "0,170 kg")',
							'type'        => 'string',
							'readonly'    => true,
						),
						'dimensions' => array(
							'description' => 'Dimensioni formattate (es. "21 × 14 × 2,5 cm")',
							'type'        => 'string',
							'readonly'    => true,
						),
					);
				},
			)
		);
	}
);
