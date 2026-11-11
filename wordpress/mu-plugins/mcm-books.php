<?php
/**
 * Plugin Name: MyChicMirror – libri e store
 * Description: Pagina del pannello per gestire i libri (titolo, copertine, sinossi dell'app, trama del sito, stato) e gli store in cui si acquistano, letti dall'app mobile e dal sito.
 * Version: 1.0.0
 *
 * Installazione: copiare questo file in wp-content/mu-plugins/. Usa la connessione
 * al database dei libri di mcm-reviews.php (costanti MCM_REVIEWS_DB_* in wp-config.php),
 * che deve essere installato.
 *
 * Tabelle in Sql1291927_2: books (letta da /API/getBooks.php) e shops (letta da
 * /API/getBookShops.php). Voti e valutazioni dei libri li scrive l'app: qui non si toccano.
 */

defined( 'ABSPATH' ) || exit;

const MCM_BOOKS_PAGE = 'mcm-books';
const MCM_BOOKS_CAP  = 'manage_options';

// Lunghezze massime delle colonne: un testo più lungo verrebbe rifiutato o tagliato da MySQL
const MCM_BOOKS_LIMITS = array(
	'title'      => 255,
	'author'     => 255,
	'cover'      => 255,
	'coverArt'   => 255,
	'notes'      => 2000,
	'plot'       => 5000,
	'shop_name'  => 50,
	'shop_url'   => 100,
);

add_action(
	'admin_menu',
	function () {
		add_menu_page( 'Libri', 'Libri', MCM_BOOKS_CAP, MCM_BOOKS_PAGE, 'mcm_books_render_page', 'dashicons-book', 25 );
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'toplevel_page_' . MCM_BOOKS_PAGE === $hook ) {
			wp_enqueue_media();
		}
	}
);

add_action( 'admin_post_mcm_book_save', 'mcm_books_handle_book_save' );
add_action( 'admin_post_mcm_shop_save', 'mcm_books_handle_shop_save' );
add_action( 'admin_post_mcm_shop_delete', 'mcm_books_handle_shop_delete' );

function mcm_books_db(): ?wpdb {
	return function_exists( 'mcm_reviews_db' ) ? mcm_reviews_db() : null;
}

function mcm_books_url( array $args = array() ): string {
	return add_query_arg( array_merge( array( 'page' => MCM_BOOKS_PAGE ), $args ), admin_url( 'admin.php' ) );
}

function mcm_books_finish( string $type, string $message, array $args = array() ): void {
	set_transient( 'mcm_books_notice_' . get_current_user_id(), array( $type, $message ), MINUTE_IN_SECONDS );
	wp_safe_redirect( mcm_books_url( $args ) );
	exit;
}

/** Controlli comuni delle azioni: permessi, nonce e connessione. */
function mcm_books_begin( string $nonce_action ): wpdb {
	if ( ! current_user_can( MCM_BOOKS_CAP ) ) {
		wp_die( 'Non hai i permessi per questa operazione.', 403 );
	}
	check_admin_referer( $nonce_action );

	$db = mcm_books_db();
	if ( ! $db ) {
		mcm_books_finish( 'error', 'Database dei libri non raggiungibile: controlla che mcm-reviews.php sia installato e le costanti MCM_REVIEWS_DB_* in wp-config.php.' );
	}

	return $db;
}

/** Il sito legge i libri dalla cache: senza questo avviso si aggiornano entro 1 ora. */
function mcm_books_changed(): void {
	delete_transient( 'mcm_reviews_books' );
	if ( function_exists( 'mcm_sync_queue' ) ) {
		mcm_sync_queue( array( 'type' => 'book' ) );
	}
}

/** Primo campo troppo lungo, come messaggio, oppure stringa vuota. */
function mcm_books_too_long( array $fields ): string {
	foreach ( $fields as $label => $field ) {
		list( $value, $limit ) = $field;
		$length                = mb_strlen( (string) $value, 'UTF-8' );
		if ( $length > $limit ) {
			return sprintf( '%s è troppo lungo: %d caratteri, il massimo è %d.', $label, $length, $limit );
		}
	}
	return '';
}

function mcm_books_handle_book_save(): void {
	$db   = mcm_books_begin( 'mcm_book_save' );
	$post = wp_unslash( $_POST );
	$id   = (int) ( $post['id'] ?? 0 );
	$back = array( 'book' => $id ?: 'new' );

	$notes = (string) ( $post['notes'] ?? '' );
	$book  = array(
		'title'            => sanitize_text_field( (string) ( $post['title'] ?? '' ) ),
		'author'           => sanitize_text_field( (string) ( $post['author'] ?? '' ) ),
		'pages'            => '' === trim( (string) ( $post['pages'] ?? '' ) ) ? null : absint( $post['pages'] ),
		'publication_date' => '' === trim( (string) ( $post['publication_date'] ?? '' ) ) ? null : absint( $post['publication_date'] ),
		'cover'            => esc_url_raw( trim( (string) ( $post['cover'] ?? '' ) ), array( 'http', 'https' ) ),
		'coverArt'         => esc_url_raw( trim( (string) ( $post['coverArt'] ?? '' ) ), array( 'http', 'https' ) ),
		// L'app mostra questo HTML così com'è
		'notes'            => trim( current_user_can( 'unfiltered_html' ) ? $notes : wp_kses_post( $notes ) ),
		'plot'             => sanitize_textarea_field( (string) ( $post['plot'] ?? '' ) ),
		'visible'          => empty( $post['visible'] ) ? 0 : 1,
		'status'           => empty( $post['status'] ) ? 0 : 1,
	);

	if ( '' === $book['title'] ) {
		mcm_books_finish( 'error', 'Il titolo è obbligatorio.', $back );
	}
	$error = mcm_books_too_long(
		array(
			'Il titolo'         => array( $book['title'], MCM_BOOKS_LIMITS['title'] ),
			"L'autore"          => array( $book['author'], MCM_BOOKS_LIMITS['author'] ),
			"L'indirizzo della copertina dell'app" => array( $book['cover'], MCM_BOOKS_LIMITS['cover'] ),
			"L'indirizzo della copertina del sito" => array( $book['coverArt'], MCM_BOOKS_LIMITS['coverArt'] ),
			"La sinossi dell'app" => array( $book['notes'], MCM_BOOKS_LIMITS['notes'] ),
			'La trama del sito' => array( $book['plot'], MCM_BOOKS_LIMITS['plot'] ),
		)
	);
	if ( $error ) {
		mcm_books_finish( 'error', $error . ' Le modifiche non sono state salvate.', $back );
	}

	$formats = array( '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s', '%d', '%d' );
	if ( $id ) {
		$saved = $db->update( 'books', $book, array( 'id' => $id ), $formats, array( '%d' ) );
	} else {
		$saved = $db->insert(
			'books',
			$book + array(
				'votes'         => 0,
				'total_ratings' => 0,
			),
			array_merge( $formats, array( '%d', '%d' ) )
		);
		$id = (int) $db->insert_id;
	}

	if ( false === $saved ) {
		mcm_books_finish( 'error', 'Salvataggio non riuscito: ' . $db->last_error, $back );
	}

	mcm_books_changed();
	mcm_books_finish( 'success', 'Libro salvato.', array( 'book' => $id ) );
}

function mcm_books_handle_shop_save(): void {
	$db      = mcm_books_begin( 'mcm_shop_save' );
	$post    = wp_unslash( $_POST );
	$book_id = (int) ( $post['bookId'] ?? 0 );
	$shop_id = (int) ( $post['shop_id'] ?? 0 );
	$back    = array( 'book' => $book_id ) + ( $shop_id ? array( 'shop' => $shop_id ) : array() );
	$name    = sanitize_text_field( (string) ( $post['name'] ?? '' ) );
	$url     = esc_url_raw( trim( (string) ( $post['url'] ?? '' ) ), array( 'http', 'https' ) );

	if ( $book_id <= 0 || '' === $name || '' === $url ) {
		mcm_books_finish( 'error', 'Indica il nome dello store e un link valido.', $back );
	}
	$error = mcm_books_too_long(
		array(
			'Il nome dello store' => array( $name, MCM_BOOKS_LIMITS['shop_name'] ),
			'Il link'             => array( $url, MCM_BOOKS_LIMITS['shop_url'] ),
		)
	);
	if ( $error ) {
		mcm_books_finish( 'error', $error . ' Per Amazon puoi usare il link breve amzn.eu che compare in "Condividi".', $back );
	}

	if ( $shop_id ) {
		$saved = $db->update(
			'shops',
			array(
				'name' => $name,
				'url'  => $url,
			),
			array(
				'id'     => $shop_id,
				'bookId' => $book_id,
			),
			array( '%s', '%s' ),
			array( '%d', '%d' )
		);
	} else {
		// La colonna notes non ha un valore predefinito: un appunto vuoto
		$saved = $db->insert(
			'shops',
			array(
				'name'   => $name,
				'url'    => $url,
				'notes'  => '',
				'bookId' => $book_id,
			),
			array( '%s', '%s', '%s', '%d' )
		);
	}

	if ( false === $saved ) {
		mcm_books_finish( 'error', 'Salvataggio dello store non riuscito: ' . $db->last_error, $back );
	}

	mcm_books_finish( 'success', $shop_id ? 'Store aggiornato.' : 'Store aggiunto.', array( 'book' => $book_id ) );
}

function mcm_books_handle_shop_delete(): void {
	$shop_id = (int) ( $_GET['shop_id'] ?? 0 );
	$book_id = (int) ( $_GET['book'] ?? 0 );
	$db      = mcm_books_begin( 'mcm_shop_delete_' . $shop_id );

	if ( false === $db->delete( 'shops', array( 'id' => $shop_id ), array( '%d' ) ) ) {
		mcm_books_finish( 'error', 'Eliminazione non riuscita: ' . $db->last_error, array( 'book' => $book_id ) );
	}

	mcm_books_finish( 'success', 'Store eliminato.', array( 'book' => $book_id ) );
}

function mcm_books_render_notice(): void {
	$key    = 'mcm_books_notice_' . get_current_user_id();
	$notice = get_transient( $key );
	if ( is_array( $notice ) ) {
		delete_transient( $key );
		printf( '<div class="notice notice-%s is-dismissible"><p>%s</p></div>', esc_attr( $notice[0] ), esc_html( $notice[1] ) );
	}
}

function mcm_books_render_list( wpdb $db ): void {
	$books = $db->get_results(
		'SELECT b.id, b.title, b.publication_date, b.visible, b.status, (SELECT COUNT(*) FROM shops s WHERE s.bookId = b.id) AS shops
		FROM books b ORDER BY b.publication_date DESC, b.id DESC',
		ARRAY_A
	);
	?>
	<p><a class="button button-primary" href="<?php echo esc_url( mcm_books_url( array( 'book' => 'new' ) ) ); ?>">Aggiungi libro</a></p>
	<table class="widefat striped">
		<thead>
			<tr><th>Titolo</th><th>Anno</th><th>Visibile</th><th>Pubblicato</th><th>Store</th></tr>
		</thead>
		<tbody>
			<?php if ( ! $books ) : ?>
				<tr><td colspan="5">Nessun libro.</td></tr>
			<?php endif; ?>
			<?php foreach ( (array) $books as $book ) : ?>
				<tr>
					<td><strong><a href="<?php echo esc_url( mcm_books_url( array( 'book' => (int) $book['id'] ) ) ); ?>"><?php echo esc_html( html_entity_decode( (string) $book['title'], ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ); ?></a></strong></td>
					<td><?php echo esc_html( (string) $book['publication_date'] ); ?></td>
					<td><?php echo $book['visible'] ? 'Sì' : 'No'; ?></td>
					<td><?php echo $book['status'] ? 'Sì' : 'No'; ?></td>
					<td><?php echo (int) $book['shops']; ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<p class="description">Visibile: il libro compare nell'app e sul sito. Pubblicato: l'app mostra i bottoni degli store.</p>
	<?php
}

function mcm_books_image_field( string $name, string $label, string $value, string $help ): void {
	?>
	<tr>
		<th scope="row"><label for="mcm-<?php echo esc_attr( $name ); ?>"><?php echo esc_html( $label ); ?></label></th>
		<td>
			<input type="url" id="mcm-<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( $name ); ?>" class="large-text" value="<?php echo esc_attr( $value ); ?>">
			<p>
				<button type="button" class="button mcm-media" data-target="mcm-<?php echo esc_attr( $name ); ?>">Scegli dalla libreria</button>
				<span class="description"><?php echo esc_html( $help ); ?></span>
			</p>
			<?php if ( $value ) : ?>
				<img src="<?php echo esc_url( $value ); ?>" alt="" style="max-height:120px;margin-top:6px;">
			<?php endif; ?>
		</td>
	</tr>
	<?php
}

function mcm_books_render_book_form( ?array $book ): void {
	$id = (int) ( $book['id'] ?? 0 );
	?>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="mcm_book_save">
		<input type="hidden" name="id" value="<?php echo esc_attr( $id ); ?>">
		<?php wp_nonce_field( 'mcm_book_save' ); ?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="mcm-title">Titolo</label></th>
				<td><input type="text" id="mcm-title" name="title" class="regular-text" required maxlength="<?php echo (int) MCM_BOOKS_LIMITS['title']; ?>" value="<?php echo esc_attr( $book['title'] ?? '' ); ?>"></td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-author">Autore</label></th>
				<td><input type="text" id="mcm-author" name="author" class="regular-text" maxlength="<?php echo (int) MCM_BOOKS_LIMITS['author']; ?>" value="<?php echo esc_attr( $book['author'] ?? 'Cristiana Sammarini' ); ?>"></td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-year">Anno di pubblicazione</label></th>
				<td><input type="number" id="mcm-year" name="publication_date" min="1900" max="2100" value="<?php echo esc_attr( $book['publication_date'] ?? '' ); ?>"></td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-pages">Pagine</label></th>
				<td><input type="number" id="mcm-pages" name="pages" min="1" value="<?php echo esc_attr( $book['pages'] ?? '' ); ?>"></td>
			</tr>
			<?php
			mcm_books_image_field( 'cover', "Copertina dell'app", (string) ( $book['cover'] ?? '' ), 'Campo cover.' );
			mcm_books_image_field( 'coverArt', 'Copertina del sito', (string) ( $book['coverArt'] ?? '' ), 'Campo coverArt, usato nella home.' );
			?>
			<tr>
				<th scope="row">Stato</th>
				<td>
					<label><input type="checkbox" name="visible" value="1" <?php checked( ! empty( $book['visible'] ) ); ?>> Visibile nell'app e sul sito</label><br>
					<label><input type="checkbox" name="status" value="1" <?php checked( ! empty( $book['status'] ) ); ?>> Pubblicato: l'app mostra i bottoni degli store</label>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm_notes">Sinossi dell'app</label></th>
				<td>
					<?php
					wp_editor(
						(string) ( $book['notes'] ?? '' ),
						'mcm_notes',
						array(
							'textarea_name' => 'notes',
							'textarea_rows' => 12,
							'media_buttons' => false,
							// L'app mostra l'HTML così com'è: niente paragrafi automatici
							'wpautop'       => false,
						)
					);
					?>
					<p class="description">Testo della finestra "Sinossi" nell'app, al massimo <?php echo (int) MCM_BOOKS_LIMITS['notes']; ?> caratteri di HTML.</p>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-plot">Trama del sito</label></th>
				<td>
					<textarea id="mcm-plot" name="plot" class="large-text" rows="8" maxlength="<?php echo (int) MCM_BOOKS_LIMITS['plot']; ?>"><?php echo esc_textarea( $book['plot'] ?? '' ); ?></textarea>
					<p class="description">Testo semplice mostrato sotto il libro nella home del sito.</p>
				</td>
			</tr>
		</table>
		<?php submit_button( $id ? 'Salva libro' : 'Crea libro', 'primary', 'submit', false ); ?>
		<a class="button" href="<?php echo esc_url( mcm_books_url() ); ?>">Torna all'elenco</a>
	</form>
	<?php
}

function mcm_books_render_shops( wpdb $db, int $book_id, int $edit_id ): void {
	$shops = $db->get_results( $db->prepare( 'SELECT id, name, url FROM shops WHERE bookId = %d ORDER BY id', $book_id ), ARRAY_A );
	$names = $db->get_col( 'SELECT DISTINCT name FROM shops ORDER BY name' );
	$edit  = null;
	foreach ( (array) $shops as $shop ) {
		if ( (int) $shop['id'] === $edit_id ) {
			$edit = $shop;
		}
	}
	?>
	<hr>
	<h2>Store</h2>
	<p>L'app mostra un bottone per ogni store, in quest'ordine, solo se il libro è pubblicato.</p>
	<table class="widefat striped">
		<thead><tr><th>Nome</th><th>Link</th><th>Azioni</th></tr></thead>
		<tbody>
			<?php if ( ! $shops ) : ?>
				<tr><td colspan="3">Nessuno store.</td></tr>
			<?php endif; ?>
			<?php foreach ( (array) $shops as $shop ) : ?>
				<?php
				$delete = wp_nonce_url(
					add_query_arg(
						array(
							'action'  => 'mcm_shop_delete',
							'shop_id' => (int) $shop['id'],
							'book'    => $book_id,
						),
						admin_url( 'admin-post.php' )
					),
					'mcm_shop_delete_' . (int) $shop['id']
				);
				?>
				<tr>
					<td><?php echo esc_html( $shop['name'] ); ?></td>
					<td><a href="<?php echo esc_url( $shop['url'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $shop['url'] ); ?></a></td>
					<td>
						<a href="<?php echo esc_url( mcm_books_url( array( 'book' => $book_id, 'shop' => (int) $shop['id'] ) ) ); ?>#mcm-shop-form">Modifica</a> |
						<a href="<?php echo esc_url( $delete ); ?>" class="submitdelete" onclick="return confirm('Eliminare questo store?');">Elimina</a>
					</td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>

	<h3 id="mcm-shop-form"><?php echo $edit ? 'Modifica store' : 'Aggiungi uno store'; ?></h3>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="mcm_shop_save">
		<input type="hidden" name="bookId" value="<?php echo esc_attr( $book_id ); ?>">
		<input type="hidden" name="shop_id" value="<?php echo esc_attr( $edit['id'] ?? 0 ); ?>">
		<?php wp_nonce_field( 'mcm_shop_save' ); ?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="mcm-shop-name">Nome</label></th>
				<td>
					<input type="text" id="mcm-shop-name" name="name" list="mcm-shop-names" class="regular-text" required maxlength="<?php echo (int) MCM_BOOKS_LIMITS['shop_name']; ?>" value="<?php echo esc_attr( $edit['name'] ?? '' ); ?>">
					<datalist id="mcm-shop-names">
						<?php foreach ( (array) $names as $name ) : ?>
							<option value="<?php echo esc_attr( $name ); ?>"></option>
						<?php endforeach; ?>
					</datalist>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="mcm-shop-url">Link</label></th>
				<td>
					<input type="url" id="mcm-shop-url" name="url" class="large-text" required placeholder="https://" value="<?php echo esc_attr( $edit['url'] ?? '' ); ?>">
					<p class="description">Al massimo <?php echo (int) MCM_BOOKS_LIMITS['shop_url']; ?> caratteri.</p>
				</td>
			</tr>
		</table>
		<?php submit_button( $edit ? 'Salva store' : 'Aggiungi store', 'secondary', 'submit', false ); ?>
		<?php if ( $edit ) : ?>
			<a class="button" href="<?php echo esc_url( mcm_books_url( array( 'book' => $book_id ) ) ); ?>">Annulla</a>
		<?php endif; ?>
	</form>
	<?php
}

/** Pulsanti "Scegli dalla libreria": mettono l'indirizzo dell'immagine nel campo. */
function mcm_books_media_script(): void {
	?>
	<script>
	document.addEventListener('click', function (event) {
		var button = event.target.closest('.mcm-media');
		if (!button || !window.wp || !wp.media) return;
		var frame = wp.media({ title: 'Scegli la copertina', library: { type: 'image' }, multiple: false });
		frame.on('select', function () {
			document.getElementById(button.dataset.target).value = frame.state().get('selection').first().get('url');
		});
		frame.open();
	});
	</script>
	<?php
}

function mcm_books_render_page(): void {
	if ( ! current_user_can( MCM_BOOKS_CAP ) ) {
		wp_die( 'Non hai i permessi per vedere questa pagina.', 403 );
	}

	$param = (string) ( $_GET['book'] ?? '' );
	$id    = (int) $param;

	echo '<div class="wrap">';
	mcm_books_render_notice();

	$db = mcm_books_db();
	if ( ! $db ) {
		echo '<h1>Libri</h1><div class="notice notice-error"><p>Database dei libri non raggiungibile: controlla che mcm-reviews.php sia installato e le costanti MCM_REVIEWS_DB_* in wp-config.php.</p></div></div>';
		return;
	}

	if ( '' === $param ) {
		echo '<h1>Libri</h1>';
		mcm_books_render_list( $db );
	} else {
		$book = $id ? $db->get_row( $db->prepare( 'SELECT * FROM books WHERE id = %d', $id ), ARRAY_A ) : null;
		if ( $id && ! $book ) {
			echo '<h1>Libri</h1><p>Libro non trovato.</p></div>';
			return;
		}
		echo '<h1>' . ( $book ? esc_html( html_entity_decode( (string) $book['title'], ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ) : 'Nuovo libro' ) . '</h1>';
		mcm_books_render_book_form( $book );
		if ( $book ) {
			mcm_books_render_shops( $db, $id, (int) ( $_GET['shop'] ?? 0 ) );
		} else {
			echo '<p class="description">Gli store si aggiungono dopo aver creato il libro.</p>';
		}
		mcm_books_media_script();
	}

	if ( $db->last_error ) {
		printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $db->last_error ) );
	}
	echo '</div>';
}
