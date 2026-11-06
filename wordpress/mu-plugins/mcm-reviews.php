<?php
/**
 * Plugin Name: MyChicMirror – recensioni dei libri
 * Description: Pagina del pannello per aggiungere, caricare da file JSON, modificare ed eliminare le recensioni dei libri mostrate sul sito.
 * Version: 2.0.0
 *
 * Installazione: copiare questo file in wp-content/mu-plugins/ e aggiungere in wp-config.php
 * i dati del database dei libri, gli stessi usati dai file PHP in /API/:
 *
 *   define( 'MCM_REVIEWS_DB_NAME', 'Sql1291927_2' );
 *   define( 'MCM_REVIEWS_DB_USER', '...' );
 *   define( 'MCM_REVIEWS_DB_PASSWORD', '...' );
 *   define( 'MCM_REVIEWS_DB_HOST', '...' ); // facoltativo: se manca vale DB_HOST
 *
 * La tabella reviews non sta nel database di WordPress, quindi il plugin apre
 * una sua connessione.
 */

defined( 'ABSPATH' ) || exit;

const MCM_REVIEWS_PAGE     = 'mcm-book-reviews';
const MCM_REVIEWS_CAP      = 'manage_options';
const MCM_REVIEWS_PER_PAGE = 20;

add_action(
	'admin_menu',
	function () {
		add_menu_page(
			'Recensioni libri',
			'Recensioni libri',
			MCM_REVIEWS_CAP,
			MCM_REVIEWS_PAGE,
			'mcm_reviews_render_page',
			'dashicons-star-filled',
			26
		);
	}
);

add_action( 'admin_post_mcm_review_save', 'mcm_reviews_handle_save' );
add_action( 'admin_post_mcm_review_delete', 'mcm_reviews_handle_delete' );
add_action( 'admin_post_mcm_reviews_import', 'mcm_reviews_handle_import' );

/** Connessione al database dei libri, o null se non è disponibile. */
function mcm_reviews_db(): ?wpdb {
	static $db = false;

	if ( false === $db ) {
		$db = null;
		if ( defined( 'MCM_REVIEWS_DB_NAME' ) && defined( 'MCM_REVIEWS_DB_USER' ) && defined( 'MCM_REVIEWS_DB_PASSWORD' ) ) {
			$host       = defined( 'MCM_REVIEWS_DB_HOST' ) ? MCM_REVIEWS_DB_HOST : DB_HOST;
			$connection = new wpdb( MCM_REVIEWS_DB_USER, MCM_REVIEWS_DB_PASSWORD, MCM_REVIEWS_DB_NAME, $host );
			if ( $connection->ready ) {
				$connection->suppress_errors( true );
				$db = $connection;
			}
		}
	}

	return $db;
}

/** Libri per il menu a tendina: id => titolo, dal più recente. */
function mcm_reviews_books(): array {
	$books = get_transient( 'mcm_reviews_books' );
	if ( is_array( $books ) ) {
		return $books;
	}

	$response = wp_remote_get( home_url( '/API/getBooks.php' ), array( 'timeout' => 10 ) );
	$data     = is_wp_error( $response ) ? null : json_decode( wp_remote_retrieve_body( $response ), true );

	$books = array();
	foreach ( (array) ( $data['data'] ?? array() ) as $book ) {
		if ( isset( $book['id'], $book['title'] ) ) {
			$books[ (int) $book['id'] ] = html_entity_decode( (string) $book['title'], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		}
	}
	if ( $books ) {
		krsort( $books );
		set_transient( 'mcm_reviews_books', $books, HOUR_IN_SECONDS );
	}

	return $books;
}

/** Valida una recensione: restituisce i campi puliti o null. */
function mcm_reviews_clean( array $input ): ?array {
	$user   = sanitize_text_field( (string) ( $input['user'] ?? '' ) );
	$review = sanitize_textarea_field( (string) ( $input['review'] ?? '' ) );
	$book   = (int) ( $input['bookId'] ?? 0 );
	$rating = $input['rating'] ?? null;
	$link   = esc_url_raw( trim( (string) ( $input['link'] ?? '' ) ), array( 'http', 'https' ) );

	if ( $book <= 0 || '' === $user || '' === $review || ! is_numeric( $rating ) ) {
		return null;
	}

	return array(
		'user'   => $user,
		'review' => $review,
		'rating' => max( 0, min( 5, (int) round( (float) $rating ) ) ),
		'bookId' => $book,
		'link'   => '' === $link ? null : $link,
	);
}

/** Vero se lo stesso testo esiste già per il libro, esclusa la riga in modifica. */
function mcm_reviews_exists( wpdb $db, array $review, int $exclude_id = 0 ): bool {
	return (bool) $db->get_var(
		$db->prepare(
			'SELECT 1 FROM reviews WHERE bookId = %d AND review = %s AND id <> %d LIMIT 1',
			$review['bookId'],
			$review['review'],
			$exclude_id
		)
	);
}

/** Aggiorna la home: senza questo avviso le recensioni restano in cache fino a 1 ora. */
function mcm_reviews_notify_frontend(): void {
	if ( function_exists( 'mcm_sync_queue' ) ) {
		mcm_sync_queue( array( 'type' => 'book_review' ) );
	}
}

function mcm_reviews_set_notice( string $type, string $message ): void {
	set_transient( 'mcm_reviews_notice_' . get_current_user_id(), array( $type, $message ), MINUTE_IN_SECONDS );
}

function mcm_reviews_url( array $args = array() ): string {
	return add_query_arg( array_merge( array( 'page' => MCM_REVIEWS_PAGE ), $args ), admin_url( 'admin.php' ) );
}

function mcm_reviews_finish( string $type, string $message, array $args = array() ): void {
	mcm_reviews_set_notice( $type, $message );
	wp_safe_redirect( mcm_reviews_url( $args ) );
	exit;
}

/** Controlli comuni delle azioni: permessi, nonce e connessione. */
function mcm_reviews_begin( string $nonce_action ): wpdb {
	if ( ! current_user_can( MCM_REVIEWS_CAP ) ) {
		wp_die( 'Non hai i permessi per questa operazione.', 403 );
	}
	check_admin_referer( $nonce_action );

	$db = mcm_reviews_db();
	if ( ! $db ) {
		mcm_reviews_finish( 'error', 'Database dei libri non raggiungibile: controlla le costanti MCM_REVIEWS_DB_* in wp-config.php.' );
	}

	return $db;
}

function mcm_reviews_handle_save(): void {
	$db     = mcm_reviews_begin( 'mcm_review_save' );
	$id     = (int) ( $_POST['id'] ?? 0 );
	$back   = $id ? array( 'edit' => $id ) : array();
	$review = mcm_reviews_clean( wp_unslash( $_POST ) );

	if ( ! $review ) {
		mcm_reviews_finish( 'error', 'Compila libro, autore, testo e voto.', $back );
	}
	if ( mcm_reviews_exists( $db, $review, $id ) ) {
		mcm_reviews_finish( 'error', 'Questa recensione esiste già per il libro scelto.', $back );
	}

	$formats = array( '%s', '%s', '%d', '%d', '%s' );
	$saved   = $id
		? $db->update( 'reviews', $review, array( 'id' => $id ), $formats, array( '%d' ) )
		: $db->insert( 'reviews', $review, $formats );

	if ( false === $saved ) {
		mcm_reviews_finish( 'error', 'Salvataggio non riuscito: ' . $db->last_error, $back );
	}

	mcm_reviews_notify_frontend();
	mcm_reviews_finish( 'success', $id ? 'Recensione aggiornata.' : 'Recensione aggiunta.' );
}

function mcm_reviews_handle_delete(): void {
	$id = (int) ( $_GET['id'] ?? 0 );
	$db = mcm_reviews_begin( 'mcm_review_delete_' . $id );

	if ( false === $db->delete( 'reviews', array( 'id' => $id ), array( '%d' ) ) ) {
		mcm_reviews_finish( 'error', 'Eliminazione non riuscita: ' . $db->last_error );
	}

	mcm_reviews_notify_frontend();
	mcm_reviews_finish( 'success', 'Recensione eliminata.' );
}

function mcm_reviews_handle_import(): void {
	$db   = mcm_reviews_begin( 'mcm_reviews_import' );
	$file = $_FILES['reviews_file'] ?? null;

	if ( ! $file || UPLOAD_ERR_OK !== $file['error'] || ! is_uploaded_file( $file['tmp_name'] ) ) {
		mcm_reviews_finish( 'error', 'Seleziona un file JSON.' );
	}

	$content = preg_replace( '/^\xEF\xBB\xBF/', '', (string) file_get_contents( $file['tmp_name'] ) );
	$groups  = json_decode( $content, true );
	if ( ! is_array( $groups ) ) {
		mcm_reviews_finish( 'error', 'Il file non contiene un JSON valido.' );
	}

	$books      = mcm_reviews_books();
	$inserted   = 0;
	$duplicates = 0;
	$invalid    = 0;
	$failed     = 0;
	$last_error = '';

	foreach ( $groups as $book_id => $reviews ) {
		foreach ( is_array( $reviews ) ? $reviews : array() as $row ) {
			$review = is_array( $row ) ? mcm_reviews_clean( array_merge( $row, array( 'bookId' => $book_id ) ) ) : null;
			if ( ! $review || ( $books && ! isset( $books[ $review['bookId'] ] ) ) ) {
				++$invalid;
			} elseif ( mcm_reviews_exists( $db, $review ) ) {
				++$duplicates;
			} elseif ( false === $db->insert( 'reviews', $review, array( '%s', '%s', '%d', '%d', '%s' ) ) ) {
				++$failed;
				$last_error = $db->last_error;
			} else {
				++$inserted;
			}
		}
	}

	if ( $inserted ) {
		mcm_reviews_notify_frontend();
	}

	$message = sprintf( 'Inserite: %d. Già presenti: %d. Non valide: %d.', $inserted, $duplicates, $invalid );
	if ( $failed ) {
		$message .= sprintf( ' Non salvate: %d (%s).', $failed, $last_error );
	}
	mcm_reviews_finish( $failed || ! $inserted ? 'warning' : 'success', $message );
}

function mcm_reviews_render_notice(): void {
	$key    = 'mcm_reviews_notice_' . get_current_user_id();
	$notice = get_transient( $key );
	if ( is_array( $notice ) ) {
		delete_transient( $key );
		printf( '<div class="notice notice-%s is-dismissible"><p>%s</p></div>', esc_attr( $notice[0] ), esc_html( $notice[1] ) );
	}
}

function mcm_reviews_book_field( array $books, int $selected ): void {
	if ( ! $books ) {
		printf( '<input type="number" id="mcm-book" name="bookId" min="1" required value="%s">', esc_attr( $selected ?: '' ) );
		echo '<p class="description">Elenco dei libri non disponibile: inserisci l\'ID del libro.</p>';
		return;
	}

	echo '<select id="mcm-book" name="bookId" required><option value="">Scegli un libro</option>';
	foreach ( $books as $id => $title ) {
		printf( '<option value="%d"%s>%s</option>', (int) $id, selected( $selected, $id, false ), esc_html( $title ) );
	}
	echo '</select>';
}

function mcm_reviews_render_form( array $books, ?array $review ): void {
	$id     = (int) ( $review['id'] ?? 0 );
	$rating = (int) ( $review['rating'] ?? 5 );
	?>
	<h2><?php echo $id ? 'Modifica recensione' : 'Aggiungi una recensione'; ?></h2>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="mcm_review_save">
		<input type="hidden" name="id" value="<?php echo esc_attr( $id ); ?>">
		<?php wp_nonce_field( 'mcm_review_save' ); ?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="mcm-book">Libro</label></th>
				<td><?php mcm_reviews_book_field( $books, (int) ( $review['bookId'] ?? 0 ) ); ?></td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-user">Autore / testo del link</label></th>
				<td>
					<input type="text" id="mcm-user" name="user" class="regular-text" required value="<?php echo esc_attr( $review['user'] ?? '' ); ?>">
					<p class="description">Se c'è un link, questo testo sul sito diventa cliccabile.</p>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-review">Recensione</label></th>
				<td><textarea id="mcm-review" name="review" class="large-text" rows="6" required><?php echo esc_textarea( $review['review'] ?? '' ); ?></textarea></td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-rating">Voto</label></th>
				<td>
					<select id="mcm-rating" name="rating">
						<?php for ( $i = 5; $i >= 0; $i-- ) : ?>
							<option value="<?php echo (int) $i; ?>" <?php selected( $rating, $i ); ?>><?php echo $i ? (int) $i : '0 (nessuna stella)'; ?></option>
						<?php endfor; ?>
					</select>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-link">Link</label></th>
				<td><input type="url" id="mcm-link" name="link" class="large-text" placeholder="https://" value="<?php echo esc_attr( $review['link'] ?? '' ); ?>"></td>
			</tr>
		</table>
		<?php submit_button( $id ? 'Salva modifiche' : 'Aggiungi recensione', 'primary', 'submit', false ); ?>
		<?php if ( $id ) : ?>
			<a class="button" href="<?php echo esc_url( mcm_reviews_url() ); ?>">Annulla</a>
		<?php endif; ?>
	</form>
	<?php
}

function mcm_reviews_render_import(): void {
	?>
	<hr>
	<h2>Carica da file JSON</h2>
	<p>Il file raggruppa le recensioni per ID del libro. Quelle già presenti vengono saltate, quindi puoi ricaricarlo senza creare doppioni.</p>
	<pre><code>{ "5": [ { "user": "Mario Rossi", "review": "Bellissimo libro", "rating": 5, "link": "https://esempio.com" } ] }</code></pre>
	<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="mcm_reviews_import">
		<?php wp_nonce_field( 'mcm_reviews_import' ); ?>
		<input type="file" name="reviews_file" accept=".json,application/json" required>
		<?php submit_button( 'Carica file', 'secondary', 'submit', false ); ?>
	</form>
	<?php
}

function mcm_reviews_render_list( wpdb $db, array $books ): void {
	$book  = (int) ( $_GET['book'] ?? 0 );
	$paged = max( 1, (int) ( $_GET['paged'] ?? 1 ) );
	$where = $book ? $db->prepare( 'WHERE bookId = %d', $book ) : '';
	$total = (int) $db->get_var( "SELECT COUNT(*) FROM reviews $where" );
	$rows  = $db->get_results(
		$db->prepare(
			"SELECT id, user, review, rating, bookId, link FROM reviews $where ORDER BY id DESC LIMIT %d OFFSET %d",
			MCM_REVIEWS_PER_PAGE,
			( $paged - 1 ) * MCM_REVIEWS_PER_PAGE
		),
		ARRAY_A
	);
	?>
	<hr>
	<h2>Recensioni salvate (<?php echo (int) $total; ?>)</h2>
	<form method="get">
		<input type="hidden" name="page" value="<?php echo esc_attr( MCM_REVIEWS_PAGE ); ?>">
		<select name="book" aria-label="Filtra per libro">
			<option value="0">Tutti i libri</option>
			<?php foreach ( $books as $id => $title ) : ?>
				<option value="<?php echo (int) $id; ?>" <?php selected( $book, $id ); ?>><?php echo esc_html( $title ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php submit_button( 'Filtra', 'secondary', '', false ); ?>
	</form>
	<br>
	<table class="widefat striped">
		<thead>
			<tr><th>Libro</th><th>Autore / link</th><th>Recensione</th><th>Voto</th><th>Azioni</th></tr>
		</thead>
		<tbody>
			<?php if ( ! $rows ) : ?>
				<tr><td colspan="5">Nessuna recensione.</td></tr>
			<?php endif; ?>
			<?php foreach ( (array) $rows as $row ) : ?>
				<?php
				$id     = (int) $row['id'];
				$text   = html_entity_decode( (string) $row['review'], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
				$delete = wp_nonce_url(
					add_query_arg(
						array(
							'action' => 'mcm_review_delete',
							'id'     => $id,
						),
						admin_url( 'admin-post.php' )
					),
					'mcm_review_delete_' . $id
				);
				?>
				<tr>
					<td><?php echo esc_html( $books[ (int) $row['bookId'] ] ?? '#' . $row['bookId'] ); ?></td>
					<td>
						<?php if ( $row['link'] ) : ?>
							<a href="<?php echo esc_url( $row['link'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $row['user'] ); ?></a>
						<?php else : ?>
							<?php echo esc_html( $row['user'] ); ?>
						<?php endif; ?>
					</td>
					<td><?php echo esc_html( mb_strimwidth( $text, 0, 140, '…', 'UTF-8' ) ); ?></td>
					<td><?php echo (int) $row['rating']; ?></td>
					<td>
						<a href="<?php echo esc_url( mcm_reviews_url( array( 'edit' => $id ) ) ); ?>">Modifica</a> |
						<a href="<?php echo esc_url( $delete ); ?>" class="submitdelete" onclick="return confirm('Eliminare questa recensione?');">Elimina</a>
					</td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<?php
	$pagination = paginate_links(
		array(
			'base'    => add_query_arg( 'paged', '%#%', mcm_reviews_url( $book ? array( 'book' => $book ) : array() ) ),
			'format'  => '',
			'current' => $paged,
			'total'   => (int) ceil( $total / MCM_REVIEWS_PER_PAGE ),
		)
	);
	if ( $pagination ) {
		echo '<div class="tablenav"><div class="tablenav-pages">' . wp_kses_post( $pagination ) . '</div></div>';
	}
}

function mcm_reviews_render_page(): void {
	if ( ! current_user_can( MCM_REVIEWS_CAP ) ) {
		wp_die( 'Non hai i permessi per vedere questa pagina.', 403 );
	}

	echo '<div class="wrap"><h1>Recensioni libri</h1>';
	mcm_reviews_render_notice();

	$db = mcm_reviews_db();
	if ( ! $db ) {
		echo '<div class="notice notice-error"><p>Database dei libri non raggiungibile: controlla le costanti MCM_REVIEWS_DB_* in wp-config.php.</p></div></div>';
		return;
	}

	$books  = mcm_reviews_books();
	$edit   = (int) ( $_GET['edit'] ?? 0 );
	$review = $edit ? $db->get_row( $db->prepare( 'SELECT * FROM reviews WHERE id = %d', $edit ), ARRAY_A ) : null;

	mcm_reviews_render_form( $books, $review );
	if ( ! $review ) {
		mcm_reviews_render_import();
	}
	mcm_reviews_render_list( $db, $books );

	if ( $db->last_error ) {
		printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $db->last_error ) );
	}
	echo '</div>';
}
