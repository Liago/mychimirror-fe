export default function Loading() {
	return (
		<div
			role="status"
			aria-label="Caricamento"
			className="flex min-h-[680px] items-center justify-center"
		>
			<span className="block h-px w-[50px] animate-pulse bg-separator" />
		</div>
	);
}
