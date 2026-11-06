<?php
/**
 * Plugin Name: MyChicMirror – caricamento recensioni libri
 * Description: Riceve le recensioni dal tool /admin/reviews-upload del frontend e le scrive nella tabella reviews: da Vercel il MySQL di Aruba non è raggiungibile.
 * Version: 1.0.0
 *
 * Installazione: copiare questo file in wp-content/mu-plugins/ (si attiva da solo)
 * e definire MCM_REVIEWS_SECRET in wp-config.php, uguale a REVIEWS_API_SECRET su Vercel.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'mcm/v1',
			'/reviews',
			array(
				'methods'             => 'POST',
				'callback'            => 'mcm_reviews_insert',
				'permission_callback' => 'mcm_reviews_authorized',
			)
		);
	}
);

function mcm_reviews_authorized( WP_REST_Request $request ) {
	$secret = defined( 'MCM_REVIEWS_SECRET' ) ? (string) MCM_REVIEWS_SECRET : '';
	$sent   = (string) $request->get_header( 'x_mcm_secret' );

	return '' !== $secret && hash_equals( $secret, $sent );
}

function mcm_reviews_insert( WP_REST_Request $request ) {
	global $wpdb;

	$reviews = $request->get_json_params()['reviews'] ?? null;
	if ( ! is_array( $reviews ) || ! $reviews ) {
		return new WP_Error( 'mcm_reviews_empty', 'Nessuna recensione ricevuta.', array( 'status' => 400 ) );
	}

	$inserted   = 0;
	$duplicates = 0;
	$failed     = 0;
	$insert_id  = 0;
	$last_error = '';

	foreach ( $reviews as $row ) {
		$book_id = (int) ( $row['bookId'] ?? 0 );
		$user    = trim( (string) ( $row['user'] ?? '' ) );
		$text    = trim( (string) ( $row['review'] ?? '' ) );
		$rating  = max( 0, min( 5, (int) ( $row['rating'] ?? 0 ) ) );
		$link    = trim( (string) ( $row['link'] ?? '' ) );

		if ( $book_id <= 0 || '' === $user || '' === $text ) {
			++$failed;
			continue;
		}

		// Ricaricare lo stesso file dopo un errore non deve creare doppioni
		$exists = $wpdb->get_var(
			$wpdb->prepare( 'SELECT 1 FROM reviews WHERE bookId = %d AND review = %s LIMIT 1', $book_id, $text )
		);
		if ( $exists ) {
			++$duplicates;
			continue;
		}

		$done = $wpdb->insert(
			'reviews',
			array(
				'user'   => $user,
				'review' => $text,
				'rating' => $rating,
				'bookId' => $book_id,
				'link'   => '' === $link ? null : $link,
			),
			array( '%s', '%s', '%d', '%d', '%s' )
		);

		if ( false === $done ) {
			++$failed;
			$last_error = $wpdb->last_error;
			continue;
		}

		++$inserted;
		$insert_id = (int) $wpdb->insert_id;
	}

	return array(
		'inserted'   => $inserted,
		'duplicates' => $duplicates,
		'failed'     => $failed,
		'error'      => $last_error,
		'insertId'   => $insert_id,
		'database'   => DB_NAME,
		'total'      => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM reviews' ),
	);
}
